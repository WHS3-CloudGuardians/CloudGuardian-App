// app.js
const express = require('express');
const path = require('path');
const authRoutes = require("./routes/AuthRoutes");
const db = require("./models");
const { errorHandler } = require("./utils/Response");

const app = express();
const PORT = 3000;

// ✅ JSON 파서 추가
app.use(express.json());

// 정적 파일 제공 (선택: public 폴더에 CSS/JS 넣을 때)
app.use(express.static(path.join(__dirname, 'public')));

// 루트 라우터
app.get('/', (req, res) => {
  res.send('<h1>Hello, Node.js 앱이 실행 중입니다!</h1>');
});

// DB 연결 및 서버 실행
db.sequelize.sync().then(() => {
  app.listen(PORT, () => 
    console.log(`서버 실행 중: http://localhost:${PORT}`)
  );
});

// 사용자
app.use("/api/auth", authRoutes);

// 에러 핸들러 사용
app.use(errorHandler);