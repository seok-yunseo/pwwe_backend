const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. 정적 파일 서비스 제일 위에 배치
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

// 2. rate-limit 설정 (API, 기타 요청에 적용)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// 3. API
app.get('/api/nord/:type', (req, res) => {
  const { type } = req.params;

  const allowedTypes = ['letters', 'mixed', 'numeric'];
  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ error: 'Invalid type parameter' });
  }

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

// 4. 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}/index.html`);
});
