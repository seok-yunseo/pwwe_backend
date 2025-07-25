// start.js
document.addEventListener('DOMContentLoaded', () => {
  // 스타일 통일
  const style = document.createElement('style');
  style.textContent = `
    * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',sans-serif; }
    body { display:flex; justify-content:center; align-items:center; height:100vh;
           background:linear-gradient(135deg,#0f2027,#203a43,#2c5364); color:#fff; text-align:center; }
    .container { max-width:600px; padding:20px; animation:fadeIn 1s ease-in; }
    h1 { font-size:2.4rem; margin-bottom:15px; }
    p { font-size:1.1rem; margin-bottom:30px; line-height:1.5; opacity:0.9; }
    .btn { display:inline-block; background:#ff9800; color:#fff; text-decoration:none;
           padding:12px 28px; border-radius:30px; font-size:1rem; font-weight:bold;
           transition:background 0.3s; cursor:pointer; }
    .btn:hover { background:#ffb74d; }
    @keyframes fadeIn { from{opacity:0; transform:translateY(20px);} to{opacity:1; transform:translateY(0);} }
  `;
  document.head.appendChild(style);

  // UI 생성
  const container = document.createElement('div');
  container.classList.add('container');

  const title = document.createElement('h1');
  title.textContent = '환영합니다!';

  const desc = document.createElement('p');
  desc.innerHTML = `비밀번호를 예측하는 사이트 입니다.<br><br>
                    시작하려면 아래 버튼을 눌러주세요.`;

  const btn = document.createElement('button');
  btn.classList.add('btn');
  btn.textContent = 'Get Started';
  btn.addEventListener('click', () => {
    window.location.href = 'question.html';
  });

  container.appendChild(title);
  container.appendChild(desc);
  container.appendChild(btn);
  document.body.appendChild(container);
});
