const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// app.use(express.json()) 아래에 추가
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 100, // 분당 100 요청 허용
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// 정적 파일 서비스 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// nord 데이터 API
app.get('/api/nord/:type', (req, res) => {
  const { type } = req.params;

  // 1. Path Traversal 방지
  const allowedTypes = ['letters', 'mixed', 'numeric'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid type parameter' });
  }

  // 2. 비동기 readFile 사용
  const filePath = path.join(__dirname, 'pwdb', `nord_${type}.json`);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    try {
      res.json(JSON.parse(data));
    } catch (parseError) {
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// 서버 실행
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}/index.html`)
);
