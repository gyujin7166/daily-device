import { escapeRegExp } from './escapeRegExp';

export const normalizeSearchTerm = (term: string): string => {
  return term
    .trim() // 앞뒤 공백 제거
    .replace(/\s+/g, ' ') // 여러 공백을 한 공백으로
    .toLowerCase() // 소문자 변환
    .normalize('NFC'); // 정규화
};

export const createSearchPattern = (term: string): string => {
  const normalized = normalizeSearchTerm(term);
  return normalized
    .split(' ')
    .map((term) => escapeRegExp(term))
    .filter(Boolean)
    .join('|');
};
