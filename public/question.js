import { generatePasswords } from './algorithm/generate.js';

document.addEventListener('DOMContentLoaded', () => {
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const resultBox = document.getElementById('resultBox');

  // step1 → step2 이동
  document.getElementById('toStep2').addEventListener('click', () => {
    step1.classList.add('hidden');
    step2.classList.remove('hidden');
  });

  // 체크박스에 따라 input 비활성화
  function toggleInput(checkboxId, inputId) {
    const checkbox = document.getElementById(checkboxId);
    const input = document.getElementById(inputId);
    checkbox.addEventListener('change', () => {
      input.disabled = checkbox.checked;
      if (checkbox.checked) input.value = '';
    });
  }
  toggleInput('noHomePhone', 'homePhone');
  toggleInput('noPhone', 'phone');
  toggleInput('noBirth', 'birth');

  // 비밀번호 생성
  document.getElementById('generate').addEventListener('click', async () => {
    const birth = document.getElementById('birth').value.split('-');

    const userData = {
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      nickname: document.getElementById('nickname').value.trim(),
      petNames: document.getElementById('petNames').value.split(',').map(p => p.trim()).filter(Boolean),
      favNums: document.getElementById('favNums').value.split(',').map(n => n.trim()).filter(Boolean),
      birthYear: birth[0],
      birthMonth: birth[1],
      birthDay: birth[2],
      phone: document.getElementById('noPhone').checked ? '' : document.getElementById('phone').value.trim(),
      homePhone: document.getElementById('noHomePhone').checked ? '' : document.getElementById('homePhone').value.trim(),
      options: {
        useName: document.getElementById('useName').checked,
        useInitial: document.getElementById('useInitial').checked,
        useNick: document.getElementById('useNick').checked,
        usePet: document.getElementById('usePet').checked,
        useFavNums: document.getElementById('useFavNums').checked,
        noBirth: document.getElementById('noBirth').checked,
        noPhone: document.getElementById('noPhone').checked,
        noHomePhone: document.getElementById('noHomePhone').checked
      }
    };

    resultBox.textContent = '비밀번호 생성 중...';

    // 비밀번호 생성
    const results = await generatePasswords(userData);

    resultBox.innerHTML = `
      <h3>USERDATA (총 ${results.user.length}개)</h3>
      <pre>${results.user.slice(0, 30).join('\n')}</pre>
      <h3>NORD (총 ${results.nord.length}개)</h3>
      <pre>${results.nord.slice(0, 30).join('\n')}</pre>
      <h3>MIX (총 ${results.mix.length}개)</h3>
      <pre>${results.mix.slice(0, 30).join('\n')}</pre>
    `;

    // end.html로 이동 버튼 이벤트
    document.getElementById('endpage').addEventListener('click', () => {
      window.location.href = 'end.html';
    });
  });
});
