// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require("./routes/AuthRoutes");
const postRoutes = require("./routes/PostRoutes");
const db = require("./models");
const { errorHandler } = require("./utils/Response");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 (개발환경)
app.use(cors({
  origin: 'http://localhost:5173'
}));

// 루트 라우터
// app.get('/', (req, res) => {
//   res.send('<h1>Hello, Node.js 앱이 실행 중입니다!</h1>');
// });

// JSON 파서 추가
app.use(express.json());

// API 라우터
app.use("/api", postRoutes);
app.use("/api/auth", authRoutes);

// 정적 파일 제공
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../client/dist')));

// 리액트 라우팅 대응
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// 에러 핸들러 사용
app.use(errorHandler);

// DB 연결 및 서버 실행
db.sequelize.sync().then(() => {
  app.listen(PORT, () => 
    console.log(`서버 실행 중: http://localhost:${PORT}`)
  );
}).catch(err => {
  console.error("DB 연결 실패:", err);
});
