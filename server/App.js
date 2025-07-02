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
const corsOptions = {
  origin: 'https://www.cloudguardian.site',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));

// JSON 파서
app.use(express.json());

// API 라우터
app.use("/api", postRoutes);
app.use("/api/auth", authRoutes);
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 정적 파일 제공
// app.use(express.static(path.join(__dirname, '../client/dist')));

// 리액트 라우팅 대응
// app.get(/^\/(?!api).*/, (req, res) => {
//  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
// });

// 에러 핸들러
app.use(errorHandler);

// DB 연결 및 서버 시작 (맨 마지막에 listen)
db.sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, '0.0.0.0', () => 
    console.log(`✅ 서버 실행 중: http://localhost:${PORT}`)
  );
}).catch(err => {
  console.error("❌ DB 연결 실패:", err);
});