require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require("./routes/AuthRoutes");
const postRoutes = require("./routes/PostRoutes");
const db = require("./models");
const { errorHandler } = require("./utils/Response");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정 (개발환경)
/*
const corsOptions = {
  origin: 'https://www.cloudguardian.site',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));
*/
app.use(cors({
  origin: 'http://localhost:5173',   // 클라이언트 주소
  credentials: true                  // 쿠키 허용
}));

// JSON 파서
app.use(express.json());

// cookie 파서
app.use(cookieParser());

// API 라우터
app.use("/api", postRoutes);
app.use("/api/auth", authRoutes);
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

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