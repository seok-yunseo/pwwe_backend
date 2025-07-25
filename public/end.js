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

  // 3. 기존 translate 함수 + 사전 정의 (복사 붙여넣기)
  function translate(text, dictionary) {
    return dictionary[text] || text;
  }

  const warningTranslations = {
    'Straight rows of keys are easy to guess':
      '키보드에서 연속된 열은 쉽게 추측됩니다.',
    'Short keyboard patterns are easy to guess':
      '짧은 키보드 패턴은 쉽게 추측됩니다.',
    'Repeats like "aaa" are easy to guess':
      '‘aaa’ 같은 반복된 문자열은 쉽게 추측됩니다.',
    'Repeats like "abcabcabc" are only slightly harder to guess than "abc"':
      '‘abcabcabc’ 같은 반복된 문자열은 ‘abc’보다 약간 더 어렵지만 여전히 쉽게 추측됩니다.',
    'Sequences like abc or 6543 are easy to guess':
      'abc나 6543 같은 연속된 문자열은 쉽게 추측됩니다.',
    'Recent years are easy to guess': '최근 연도는 쉽게 추측됩니다.',
    'Dates are often easy to guess': '날짜는 자주 쉽게 추측됩니다.',
    'This is similar to a commonly used password':
      '일반적으로 많이 사용되는 비밀번호와 유사합니다.',
    'This is a top-10 common password':
      '상위 10위 안에 드는 흔한 비밀번호입니다.',
    'This is a top-100 common password':
      '상위 100위 안에 드는 흔한 비밀번호입니다.',
    'This is a very common password': '아주 흔하게 사용되는 비밀번호입니다.',
    'A word by itself is easy to guess':
      '단어 하나만으로 된 비밀번호는 쉽게 추측됩니다.',
    'Names and surnames by themselves are easy to guess':
      '이름이나 성만으로 된 비밀번호는 쉽게 추측됩니다.',
    "Capitalization doesn't help very much":
      '대소문자 구분만으로는 보안에 큰 도움이 되지 않습니다.',
    'All-uppercase is almost as easy to guess as all-lowercase':
      '모두 대문자로 쓰는 것도 모두 소문자만큼 쉽게 추측됩니다.',
    "Reversed words aren't much harder to guess":
      '단어를 뒤집어도 보안성이 크게 향상되지 않습니다.',
    "Predictable substitutions like '@' instead of 'a' don't help very much":
      '‘a’를 ‘@’로 바꾸는 등의 예측 가능한 치환은 큰 도움이 되지 않습니다.',
  };

  const suggestionTranslations = {
    'Use a few words, avoid common phrases':
      '몇 개의 단어만 사용하고 흔한 구문은 피하세요.',
    'No need for symbols, digits, or uppercase letters':
      '기호, 숫자, 대문자는 꼭 필요하지 않습니다.',
    'Add another word or two. Uncommon words are better.':
      '단어를 한두 개 더 추가하세요. 드문 단어가 더 안전합니다.',
    'Use a longer keyboard pattern with more turns':
      '방향 전환이 많은 더 긴 키보드 패턴을 사용하세요.',
    'Avoid repeated words and characters': '반복되는 문자나 단어를 피하세요.',
    'Avoid sequences': '연속된 문자나 숫자(예: abc, 123)를 피하세요.',
    'Avoid recent years': '최근 연도를 사용하지 마세요.',
    'Avoid years that are associated with you':
      '자신과 관련된 연도는 사용하지 마세요.',
    'Avoid dates and years that are associated with you':
      '자신과 관련된 날짜나 연도는 사용하지 마세요.',
    "Capitalization doesn't help very much":
      '대소문자 구분만으로는 보안이 충분하지 않습니다.',
    'All-uppercase is almost as easy to guess as all-lowercase':
      '모두 대문자로 쓰는 것도 모두 소문자만큼 쉽게 추측됩니다.',
    "Reversed words aren't much harder to guess":
      '단어를 뒤집어 쓰는 것은 큰 도움이 되지 않습니다.',
    "Substituting symbols or numbers for letters (e.g. '@' instead of 'a') doesn't help very much":
      '글자를 기호나 숫자로 바꾸는 것은 보안에 큰 도움이 되지 않습니다.',
  };

  // ===== userInfo 가져오기 (없으면 더미데이터 사용) =====
  let info = JSON.parse(localStorage.getItem('userInfo') || '{}');
  if (Object.keys(info).length === 0) {
    info = {
      firstName: 'Min',
      lastName: 'Kim',
      nickname: 'mini',
      petNames: ['navi'],
      favNums: ['77'],
      phone: '01012345678',
      birthYear: '1995',
      birthMonth: '09',
      birthDay: '17',
      homePhone: '0212345678',
      options: {
        useName: false,
        useInitial: false,
        useNick: false,
        usePet: false,
        noBirth: false,
        noPhone: false,
        noHomePhone: false,
        useFavNums: false,
      },
    };
  }

  // ===== 비밀번호 리스트 생성 =====
  const passwords = await generatePasswords(info);
  const allPasswords = new Set([
    ...passwords.user,
    ...passwords.nord,
    ...passwords.mix,
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

    // warning 번역 적용
    if (result.feedback.warning) {
      const translatedWarning = translate(
        result.feedback.warning,
        warningTranslations
      );
      message += `\n⚠️ ${translatedWarning}`;
    }

    // suggestions 번역 적용
    if (result.feedback.suggestions.length) {
      const translatedSuggestions = result.feedback.suggestions
        .map((s) => translate(s, suggestionTranslations))
        .join('\n- ');
      message += `\n💡 ${translatedSuggestions}`;
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
