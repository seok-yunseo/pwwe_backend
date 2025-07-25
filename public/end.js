import { generatePasswords } from './algorithm/generate.js';

document.addEventListener('DOMContentLoaded', async () => {
  // ===== 스타일 추가 =====
  const style = document.createElement('style');
  style.textContent = `
    * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',sans-serif; }
    body {
      display:flex; justify-content:center; align-items:center;
      height:100vh; background:linear-gradient(135deg,#0f2027,#203a43,#2c5364);
      color:#fff; text-align:center;
    }
    .container {
      background: rgba(255,255,255,0.05);
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      width: 400px;
      animation: fadeIn 0.8s ease-in;
      text-align:center;
    }
    h2 { margin-bottom:15px; font-size:1.5rem; }
    input[type="password"] {
      width: 100%; padding:10px; margin-top:6px; font-size:1rem;
      border:none; border-radius:6px;
      background: rgba(255,255,255,0.1);
      color:#fff;
    }
    input:focus { outline: 2px solid #ff9800; }
    #pwStrength, #checkResult {
      margin-top: 15px;
      text-align: left;
      background: rgba(255,255,255,0.1);
      border-radius: 6px;
      padding: 12px;
      white-space: pre-wrap;
      font-size: 0.9rem;
      min-height: 60px;
    }
    button {
      width: 100%;
      background: #ff9800;
      color: #fff;
      font-weight: bold;
      border: none;
      border-radius: 6px;
      padding: 10px;
      margin-top: 8px;
      cursor: pointer;
    }
    button:hover { background: #ffb74d; }
    @keyframes fadeIn { 
      from {opacity:0; transform:translateY(15px);} 
      to {opacity:1; transform:translateY(0);} 
    }
  `;
  document.head.appendChild(style);

  // ===== 컨테이너 생성 =====
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <h2>비밀번호 강도 체크 & 포함 여부</h2>
    <input type="password" id="pwInput" placeholder="비밀번호 입력" autocomplete="off" />
    <p id="pwStrength"></p>
    <button id="checkBtn">리스트에 있는지 확인</button>
    <div id="checkResult"></div>
  `;
  document.body.appendChild(container);

  // ===== userInfo 가져오기 (없으면 더미데이터 사용) =====
  let info = JSON.parse(localStorage.getItem('userInfo') || '{}');
  if (Object.keys(info).length === 0) {
    info = {
      firstName: "Min",
      lastName: "Kim",
      nickname: "mini",
      petNames: ["navi"],
      favNums: ["77"],
      phone: "01012345678",
      birthYear: "1995",
      birthMonth: "09",
      birthDay: "17",
      homePhone: "0212345678",
      options: {
        useName: false,
        useInitial: false,
        useNick: false,
        usePet: false,
        noBirth: false,
        noPhone: false,
        noHomePhone: false,
        useFavNums: false
      }
    };
  }

  // ===== 비밀번호 리스트 생성 =====
  const passwords = await generatePasswords(info);
  const allPasswords = new Set([
    ...passwords.user,
    ...passwords.nord,
    ...passwords.mix
  ]);

  // ===== zxcvbn 강도 체크 =====
  const pwInput = document.getElementById('pwInput');
  const pwStrength = document.getElementById('pwStrength');
  const checkBtn = document.getElementById('checkBtn');
  const checkResult = document.getElementById('checkResult');

  pwInput.addEventListener('input', () => {
    if (typeof zxcvbn !== 'function') {
      pwStrength.textContent = '⚠️ zxcvbn 로드 실패!';
      return;
    }
    const password = pwInput.value;
    const result = zxcvbn(password);
    const level = ['매우 약함', '약함', '보통', '강함', '매우 강함'];

    let message = `강도: ${level[result.score]} (${result.score}/4)`;
    if (result.feedback.warning) {
      message += `\n⚠️ ${result.feedback.warning}`;
    }
    if (result.feedback.suggestions.length) {
      message += `\n💡 ${result.feedback.suggestions.join('\n- ')}`;
    }
    pwStrength.textContent = message;
  });

  // ===== 리스트 포함 여부 체크 =====
  checkBtn.addEventListener('click', () => {
    const pw = pwInput.value.trim();
    if (!pw) {
      checkResult.textContent = '비밀번호를 입력해주세요.';
      checkResult.style.color = 'yellow';
      return;
    }

    if (allPasswords.has(pw)) {
      checkResult.textContent = '✅ 리스트에 포함된 비밀번호입니다!';
      checkResult.style.color = 'lightgreen';
    } else {
      checkResult.textContent = '❌ 리스트에 없는 비밀번호입니다.';
      checkResult.style.color = 'red';
    }
  });
});
