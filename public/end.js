document.addEventListener('DOMContentLoaded', () => {
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

  // localStorage에서 최종 리스트 가져오기
  const savedList = JSON.parse(localStorage.getItem('finalPasswords') || '[]');
  const allPasswords = new Set(savedList);

  // DOM 요소 가져오기
  const pwInput = document.getElementById('pwInput');
  const pwStrength = document.getElementById('pwStrength');
  const pwCount = document.getElementById('pwCount');
  const checkBtn = document.getElementById('checkBtn');
  const checkResult = document.getElementById('checkResult');

  // 개수 표시
  pwCount.textContent = `총 ${allPasswords.size}개의 비밀번호가 생성됨`;

  // 강도 체크
  pwInput.addEventListener('input', function () {
    const password = this.value;
    const result = zxcvbn(password);
    const score = result.score;

    const warning = translate(result.feedback.warning, warningTranslations);
    const suggestions = result.feedback.suggestions
      .map((s) => translate(s, suggestionTranslations))
      .join('\n- ');

    const level = ['매우 약함', '약함', '보통', '강함', '매우 강함'];

    let message = `강도: ${level[score]} (${score} / 4)`;
    if (score < 3) {
      if (warning) message += `<br>⚠️ ${warning}`;
      if (suggestions)
        message += `<br>💡 추천 해결책<br> - ${suggestions.replace(
          /\n- /g,
          '<br> - '
        )}`;
    }
    pwStrength.innerHTML = message;
  });

  // 포함 여부 체크
  checkBtn.addEventListener('click', () => {
    const pw = pwInput.value.trim();
    if (!pw) {
      checkResult.textContent = '비밀번호를 입력해주세요.';
      checkResult.style.color = 'yellow';
      return;
    }
    if (allPasswords.has(pw)) {
      checkResult.innerHTML = `
      <span style="color: lightgreen;">✅ 리스트에 포함된 비밀번호입니다!</span><br>
      <span style="color: red; background-color: yellow; font-weight: bold; padding: 2px 4px; border-radius: 4px; display: inline-block;">
      ⚠️ 해커는 단순한 반복 시도로도 몇 초 안에 이 비밀번호를 알아낼 수 있습니다.
    </span>
      `;
      checkResult.style.color = 'lightgreen';
    } else {
      checkResult.textContent = '❌ 리스트에 없는 비밀번호입니다.';
      checkResult.style.color = 'red';
    }
  });
});
