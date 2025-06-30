// server/controllers/PostController.js
const fs   = require('fs');
const path = require('path');
const db = require('../models');
const Post = db.Post;
const User = db.User;

// POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, board } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const post = await Post.create({
      title, content, board,
      mediaUrl,
      userId: req.user.id
    });
    res.status(201).json({ status:201, code:'SUCCESS', message:'글 작성 성공', data:{ post } });
  } catch (err) {
    next(err);
  }
};

exports.listPosts = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page  || '1', 10);
    const board = req.query.board === 'all' ? null : req.query.board;
    const limit = 10;
    const where = board ? { board } : {};

    const { count, rows } = await Post.findAndCountAll({
      where,
      offset: (page - 1) * limit,
      limit,
      order: [['createdAt', 'DESC']],
      include: [{ model: db.User, attributes: ['username'] }]
    });

    const totalPages = Math.ceil(count / limit);
    // rows 안의 User.username을 author 로 복제
    const items = rows.map(p => ({
      id:        p.id,
      board:     p.board,
      title:     p.title,
      author:    p.User?.username ?? '탈퇴한 회원',
      views:     p.viewCount,
      createdAt: p.createdAt
    }));

    return res.json({ items, totalPages });
  } catch (err) {
    next(err);
  }
};

exports.listBoards = async (req, res, next) => {
  try {
    // 예시: 하드코딩된 게시판 목록
    const boards = [
      { key: 'all',   name: '전체'   },
      { key: 'free',   name: '자유' },
      { key: 'inform',  name: '정보'   },
      // 필요에 따라 모델로 뽑아오셔도 됩니다
    ];
    res.json(boards);
  } catch (err) {
    next(err);
  }
};

exports.getPostById = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    // 1) 게시글 조회 (작성자 정보 포함)
    const post = await Post.findByPk(postId, {
      include: [{ model: User, attributes: ['username'] }]
    });

    if (!post) {
      return res.status(404).json({
        status: 404,
        code: 'NOT_FOUND',
        message: '존재하지 않는 게시글입니다.'
      });
    }

    // 2) 조회수 1 증가
    await post.increment('viewCount');
    await post.reload();

    // 3) 응답 데이터 포맷으로 가공
    const result = {
      id:        post.id,
      board:     post.board,
      title:     post.title,
      content:   post.content,
      mediaUrl:  post.mediaUrl,
      author:    post.User?.username ?? '탈퇴한 회원', 
      userId:    post.userId,
      views:     post.viewCount, // increment 한 뒤의 값
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    return res.json({
      status: 200,
      code: 'SUCCESS',
      message: '게시글 조회 성공',
      data: { post: result }
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { title, content, board } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    // 1) 기존 글 불러오기
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ status:404, code:'NOT_FOUND', message:'게시글이 없습니다.' });

    // 2) 작성자가 맞는지 확인
    if (post.userId !== req.user.id) return res.status(403).json({ status:403, code:'FORBIDDEN', message:'권한이 없습니다.' });

    // 3) 업데이트
    await post.update({
      title,
      content,
      board,
      ...(mediaUrl !== undefined ? { mediaUrl } : {})
    });

    return res.json({ status:200, code:'SUCCESS', message:'수정 성공', data:{ post } });
  } catch (err) {
    next(err);
  }
};
// DELETE /api/posts/:postId
exports.deletePost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ status:404, ode:'NOT_FOUND', message:'게시글이 없습니다.' });

    if (post.userId !== req.user.id) return res.status(403).json({ status:403, code:'FORBIDDEN', message:'권한이없습니다.' });

    await post.destroy();
    if (post.mediaUrl) {
      const filePath = path.resolve(__dirname, '../public', post.mediaUrl.replace(/^\//, ''));
      fs.unlink(filePath, err => {
        if (err && err.code !== 'ENOENT') {
          console.error('파일 삭제 오류:', err);
        }
      });
    }
    return res.json({ status:200, code:'SUCCESS', message:'삭제 성공' });
  } catch (err) {
    next(err);
  }
};
