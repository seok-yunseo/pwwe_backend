document.addEventListener('DOMContentLoaded', () => {
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
  pwInput.addEventListener('input', () => {
    if (typeof zxcvbn !== 'function') {
      pwStrength.textContent = '⚠️ zxcvbn 로드 실패!';
      return;
    }
    const result = zxcvbn(pwInput.value);
    const level = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
    pwStrength.textContent = `강도: ${level[result.score]} (${result.score}/4)`;
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
      checkResult.textContent = '✅ 리스트에 포함된 비밀번호입니다!';
      checkResult.style.color = 'lightgreen';
    } else {
      checkResult.textContent = '❌ 리스트에 없는 비밀번호입니다.';
      checkResult.style.color = 'red';
    }
  });
});
