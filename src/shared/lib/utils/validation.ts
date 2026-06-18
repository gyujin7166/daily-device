export const isValidName = (input: string) => {
  const name = input.replace(/\s+/g, ' ').trim(); // 줄바꿈, 탭 포함 모든 공백을 스페이스 1칸으로

  return /^[A-Za-z가-힣0-9 ]+$/.test(name);
};
