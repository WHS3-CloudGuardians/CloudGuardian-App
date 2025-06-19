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
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173'
}));

// console.log(process.env.JWT_SECRET);

// JSON 파서 추가
app.use(express.json());
app.use("/api", postRoutes);
app.use("/api/auth", authRoutes);

// 정적 파일 제공 (선택: public 폴더에 CSS/JS 넣을 때)
app.use(express.static(path.join(__dirname, 'public')));

// console.log('⟡ dotenv.config() →', require('dotenv').config());

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

// 에러 핸들러 사용
app.use(errorHandler);
