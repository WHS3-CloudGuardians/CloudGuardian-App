// server/controllers/PostController.js
const fs   = require('fs');
const path = require('path');
const redis = require('../redis');
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
    await invalidatePostCache();
    res.status(201).json({ status:201, code:'SUCCESS', message:'글 작성 성공', data:{ post } });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts
exports.listPosts = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page  || '1', 10);
    const board = req.query.board === 'all' ? 'all' : req.query.board;
    const cacheKey = `posts:${board}:page:${page}`;

    // 1) 캐시 확인
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // 2) DB 조회
    const limit = 10;
    const where = board !== 'all' ? { board } : {};
    const { count, rows } = await Post.findAndCountAll({
      where,
      offset: (page - 1) * limit,
      limit,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['username'] }]
    });

    const totalPages = Math.ceil(count / limit);
    const items = rows.map(p => ({
      id:        p.id,
      board:     p.board,
      title:     p.title,
      author:    p.User?.username ?? '탈퇴한 회원',
      views:     p.viewCount,
      createdAt: p.createdAt
    }));

    const payload = { items, totalPages };

    // 3) 캐시에 저장 (TTL 60초)
    await redis.set(cacheKey, JSON.stringify(payload), 'EX', 30);

    return res.json(payload);
  } catch (err) {
    next(err);
  }
};

exports.listBoards = async (req, res, next) => {
  try {
    const cacheKey = 'boards';
    const cached = await redis.get(cacheKey);
    if (cached) return res.json(JSON.parse(cached));

    const boards = [
      { key: 'all',   name: '전체' },
      { key: 'free',  name: '자유' },
      { key: 'inform',name: '정보' }
    ];
    // TTL 300초 예시
    await redis.set(cacheKey, JSON.stringify(boards), 'EX', 300);
    res.json(boards);
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:postId
exports.getPostById = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const cacheKey = `post:${postId}`;

    // 캐시 확인
    const cached = await redis.get(cacheKey);
    if (cached) {
      // 캐시된 응답은 { status, code, message, data:{ post } }
      return res.json(JSON.parse(cached));
    }

    // DB 조회 + 조회수 증가 등...
    const post = await Post.findByPk(postId, {
      include: [{ model: User, attributes: ['username'] }]
    });
    if (!post) return res.status(404).json({ /* ... */ });

    await post.increment('viewCount');
    await post.reload();

    const result = {
      id:        post.id,
      board:     post.board,
      title:     post.title,
      content:   post.content,
      mediaUrl:  post.mediaUrl,
      author:    post.User?.username ?? '탈퇴한 회원',
      userId:    post.userId,
      views:     post.viewCount,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
    const response = {
      status: 200,
      code: 'SUCCESS',
      message: '게시글 조회 성공',
      data: { post: result }
    };

    // 캐시에 저장 (TTL 60초)
    await redis.set(cacheKey, JSON.stringify(response), 'EX', 30);

    return res.json(response);
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

    await invalidatePostCache();
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
    await invalidatePostCache();
    return res.json({ status:200, code:'SUCCESS', message:'삭제 성공' });
  } catch (err) {
    next(err);
  }
};

// POST, PUT, DELETE 후 캐시 무효화
async function invalidatePostCache() {
  const keys = await redis.keys('posts:*');
  if (keys.length) await redis.del(...keys);
  await redis.del('boards');
}

// 성능 이슈 있으면 이걸로 수정
/* async function invalidatePostCache() {
  const stream = redis.scanStream({ match: 'posts:*' });
  const pipeline = redis.pipeline();
  stream.on('data', (keys = []) => keys.forEach(key => pipeline.del(key)));
  await new Promise(resolve => stream.on('end', resolve));
  await pipeline.exec();
  await redis.del('boards');
} */
