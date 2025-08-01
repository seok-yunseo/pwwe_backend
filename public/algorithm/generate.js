// Nord 데이터 불러오기
async function loadNordData() {
  const [letters, mixed, numeric] = await Promise.all([
    fetch('/api/nord/letters').then((r) => r.json()),
    fetch('/api/nord/mixed').then((r) => r.json()),
    fetch('/api/nord/numeric').then((r) => r.json())
  ]);
  return { nordWord: [...letters, ...mixed], nordNum: numeric };
}

function isValid(pw) {
  const specials = pw.match(/[!@#$]/g) || [];
  return (
    pw.length >= 7 &&
    pw.length <= 10 &&
    /[a-z]/i.test(pw) &&
    /[0-9]/.test(pw) &&
    specials.length === 1
  );
}

// 사용자 입력 기반 생성
function generateFromUserInfo(info) {
  const baseWords = [];

  if (!info.options.useNick && info.nickname)
    baseWords.push(info.nickname.toLowerCase());
  if (!info.options.usePet && info.petNames?.length)
    baseWords.push(...info.petNames.map((p) => p.toLowerCase()));

  if (!info.options.useName) {
    if (info.firstName) baseWords.push(info.firstName.toLowerCase());
    if (info.lastName) baseWords.push(info.lastName.toLowerCase());
  }

  // 이니셜 + CamelCase 분리
  if (!info.options.useInitial) {
    const initialsLast = [];
    const initialsFirst = [];
    const fullNameParts = new Set();

    if (info.lastName) {
      for (const ch of info.lastName)
        if (/[A-Z]/.test(ch)) initialsLast.push(ch.toLowerCase());
      fullNameParts.add(info.lastName.toLowerCase());
    }
    if (info.firstName) {
      for (const ch of info.firstName)
        if (/[A-Z]/.test(ch)) initialsFirst.push(ch.toLowerCase());
      fullNameParts.add(info.firstName.toLowerCase());
      info.firstName
        .split(/(?=[A-Z])/)
        .forEach((part) => fullNameParts.add(part.toLowerCase()));
    }

    const combinations = new Set();
    for (const l of initialsLast) {
      if (initialsFirst.length) {
        combinations.add(l + initialsFirst.join(''));
        combinations.add(initialsFirst.join('') + l);
      } else combinations.add(l);
    }
    if (initialsFirst.length) combinations.add(initialsFirst.join(''));
    if (initialsFirst.length && info.lastName)
      combinations.add(initialsFirst.join('') + info.lastName.toLowerCase());

    initialsLast.forEach((ch) => combinations.add(ch));
    initialsFirst.forEach((ch) => combinations.add(ch));
    fullNameParts.forEach((word) => combinations.add(word));

    baseWords.push(...combinations);
  }

  // 숫자 조합
  const numberParts = [];
  if (info.birthYear && info.birthMonth && info.birthDay && !info.options.noBirth) {
    numberParts.push(
      info.birthYear,
      info.birthYear.slice(2),
      info.birthMonth,
      info.birthDay,
      info.birthMonth + info.birthDay,
      info.birthYear.slice(2) + info.birthMonth + info.birthDay
    );
  }
  if (info.phone?.length >= 8 && !info.options.noPhone) {
    numberParts.push(info.phone.slice(-4), info.phone.slice(-8, -4));
  }
  if (info.homePhone?.length >= 7 && !info.options.noHomePhone) {
    numberParts.push(info.homePhone.slice(-4), info.homePhone.slice(-7, -4));
  }
  if (!info.options.useFavNums && info.favNums?.length)
    numberParts.push(...info.favNums);

  const specials = ['!', '@', '#', '$'];
  const results = new Set();

  for (let word of baseWords) {
    for (let num of numberParts) {
      for (let s of specials) {
        const patterns = [
          `${s}${word}${num}`,
          `${word}${num}${s}`,
          `${word}${s}${num}`,
          `${s}${num}${word}`,
          `${num}${word}${s}`,
          `${num}${s}${word}`
        ];
        if (isValid(word + num)) results.add(word + num);
        for (let pw of patterns) if (isValid(pw)) results.add(pw);
      }
    }
  }

  return { pw: Array.from(results), numberParts };
}

// Nord 기반 생성
function generateFromNordWords(nordWords = [], numberParts = []) {
  const specials = ['!', '@', '#', '$'];
  const results = new Set();
  for (let word of nordWords) {
    for (let num of numberParts) {
      for (let s of specials) {
        const patterns = [
          `${s}${word}${num}`,
          `${word}${num}${s}`,
          `${word}${s}${num}`,
          `${s}${num}${word}`,
          `${num}${word}${s}`,
          `${num}${s}${word}`
        ];
        for (let pw of patterns) if (isValid(pw)) results.add(pw);
      }
    }
  }
  return Array.from(results);
}

// Mixed 생성
function generateMixPasswords(userWords = [], userNumbers = [], nordWords = [], nordNumbers = [], limit = 10000) {
  const specials = ['!', '@', '#', '$'];
  const mixResults = new Set();

  for (let uw of userWords) {
    for (let un of userNumbers) {
      for (let nw of nordWords) {
        for (let nn of nordNumbers) {
          for (let s of specials) {
            if (mixResults.size >= limit) return Array.from(mixResults);

            const patterns = [
              `${s}${uw}${nn}`, `${uw}${nn}${s}`, `${uw}${s}${nn}`,
              `${s}${nn}${uw}`, `${nn}${uw}${s}`, `${nn}${s}${uw}`,
              `${s}${nw}${un}`, `${nw}${un}${s}`, `${nw}${s}${un}`,
              `${s}${un}${nw}`, `${un}${nw}${s}`, `${un}${s}${nw}`
            ];

            for (let pw of patterns) {
              if (isValid(pw)) mixResults.add(pw);
              if (mixResults.size >= limit) return Array.from(mixResults);
            }
          }
        }
      }
    }
  }
  return Array.from(mixResults);
}

// 최종 함수
export async function generatePasswords(info) {
  const { pw: userPw, numberParts: userNum } = generateFromUserInfo(info);

  const allChecked = Object.values(info.options).every((v) => v === true);
  let nordPw = [];
  let mixPw = [];

  if (allChecked) {
    const { nordWord, nordNum } = await loadNordData();
    nordPw = generateFromNordWords(nordWord, nordNum);
  } else {
    const { nordWord, nordNum } = await loadNordData();
    mixPw = generateMixPasswords(userPw, userNum, nordWord, nordNum, 10000);
  }

  // 결과 저장
  const results = { user: userPw, nord: nordPw, mix: mixPw };
  const allPasswords = [...results.user, ...results.nord, ...results.mix];
  localStorage.setItem('finalPasswords', JSON.stringify(allPasswords));

  return results;
}
