// server/routes/PostRoutes.js
const express = require('express');
const router = express.Router();
const multer  = require('multer');
const path    = require('path');
const verify  = require('../middlewares/AuthMiddleware');
const postCtl = require('../controllers/PostController');

// Multer 세팅 (public/uploads 폴더에 저장)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.resolve(__dirname, '../public/uploads')),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});
const upload = multer({ storage });

// 글쓰기 (인증 필요 + 파일 업로드)
router.post(
  '/posts',
  verify,
  upload.single('media'),
  postCtl.createPost
);

// 글 수정
router.put(
  '/posts/:postId',
  verify,
  upload.single('media'),
  postCtl.updatePost
);

router.delete(
  '/posts/:postId',
  verify,
  postCtl.deletePost
);

router.get('/posts',           postCtl.listPosts);
router.get('/posts/:postId',   postCtl.getPostById);
router.get('/boards',          postCtl.listBoards);

module.exports = router;
