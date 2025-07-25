const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 정적 파일 서비스 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// nord 데이터 API
app.get('/api/nord/:type', (req, res) => {
  const { type } = req.params;
  const filePath = path.join(__dirname, 'pwdb', `nord_${type}.json`);

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

// 서버 실행
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}/start.html`));
