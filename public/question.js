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

    // 결과 박스 초기화
    resultBox.textContent = ''; 

    // 보여줄 섹션 목록
    const sections = [
      { title: 'USERDATA', data: results.user },
      { title: 'NORD', data: results.nord },
      { title: 'MIX', data: results.mix }
    ];

    // 각 섹션별로 안전하게 DOM 생성
    sections.forEach(section => {
      // 제목
      const h3 = document.createElement('h3');
      h3.textContent = `${section.title} (총 ${section.data.length}개)`;
      resultBox.appendChild(h3);

      // 데이터
      const pre = document.createElement('pre');
      // textContent 사용 → HTML escape 자동 처리
      pre.textContent = section.data.slice(0, 30).join('\n');
      resultBox.appendChild(pre);
    });


    // end.html로 이동 버튼 이벤트
    document.getElementById('endpage').addEventListener('click', () => {
      window.location.href = 'end.html';
    });
  });
});
