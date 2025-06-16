// app.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// 정적 파일 제공 (선택: public 폴더에 CSS/JS 넣을 때)
app.use(express.static(path.join(__dirname, 'public')));

// 루트 라우터
app.get('/', (req, res) => {
  res.send('<h1>Hello, Node.js 앱이 실행 중입니다!</h1>');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`✅ 서버가 실행되었습니다: http://localhost:${PORT}`);
});
