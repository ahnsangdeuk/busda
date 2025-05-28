// 한글 초성 배열
const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

// 한글 중성 배열
const JUNGSUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
];

// 한글 종성 배열
const JONGSUNG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
];

/**
 * 한글 문자를 초성, 중성, 종성으로 분리
 */
export function decomposeHangul(char: string): { cho: string; jung: string; jong: string } {
  const code = char.charCodeAt(0) - 0xAC00;
  
  if (code < 0 || code > 11171) {
    // 한글이 아닌 경우
    return { cho: char, jung: '', jong: '' };
  }
  
  const cho = Math.floor(code / 588);
  const jung = Math.floor((code % 588) / 28);
  const jong = code % 28;
  
  return {
    cho: CHOSUNG[cho],
    jung: JUNGSUNG[jung],
    jong: JONGSUNG[jong]
  };
}

/**
 * 문자열의 초성만 추출
 */
export function extractChosung(text: string): string {
  return text
    .split('')
    .map(char => {
      const decomposed = decomposeHangul(char);
      return decomposed.cho;
    })
    .join('');
}

/**
 * 초성 검색 매칭
 */
export function matchesChosung(text: string, searchQuery: string): boolean {
  const textChosung = extractChosung(text);
  const queryChosung = extractChosung(searchQuery);
  
  // 초성만으로 이루어진 검색어인지 확인
  const isChosungOnly = /^[ㄱ-ㅎ]+$/.test(searchQuery);
  
  if (isChosungOnly) {
    return textChosung.includes(searchQuery);
  }
  
  return textChosung.includes(queryChosung);
}

/**
 * 부분 검색 매칭
 */
export function matchesPartial(text: string, searchQuery: string): boolean {
  const normalizedText = text.toLowerCase().replace(/\s+/g, '');
  const normalizedQuery = searchQuery.toLowerCase().replace(/\s+/g, '');
  
  return normalizedText.includes(normalizedQuery);
}

/**
 * 퍼지 검색 (오타 허용)
 */
export function getFuzzyScore(text: string, searchQuery: string): number {
  const textLower = text.toLowerCase();
  const queryLower = searchQuery.toLowerCase();
  
  let score = 0;
  let queryIndex = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 1;
      queryIndex++;
    }
  }
  
  // 완전 매칭된 비율 계산
  return score / queryLower.length;
}

/**
 * 종합적인 검색 매칭 및 점수 계산
 */
export function getSearchScore(text: string, searchQuery: string): number {
  if (!searchQuery.trim()) return 0;
  
  const query = searchQuery.trim();
  
  // 1. 완전 일치 (최고 점수)
  if (text === query) return 100;
  
  // 2. 시작 문자 일치
  if (text.startsWith(query)) return 90;
  
  // 3. 부분 문자열 일치
  if (matchesPartial(text, query)) return 80;
  
  // 4. 초성 일치
  if (matchesChosung(text, query)) return 70;
  
  // 5. 퍼지 매칭
  const fuzzyScore = getFuzzyScore(text, query);
  if (fuzzyScore > 0.5) return 50 + fuzzyScore * 20;
  
  return 0;
}

/**
 * 검색 결과 정렬을 위한 비교 함수
 */
export function createSearchComparator(searchQuery: string) {
  return (a: any, b: any) => {
    const scoreA = getSearchScore(a.stopName || a.name || '', searchQuery);
    const scoreB = getSearchScore(b.stopName || b.name || '', searchQuery);
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // 높은 점수 우선
    }
    
    // 점수가 같으면 이름 순 정렬
    const nameA = a.stopName || a.name || '';
    const nameB = b.stopName || b.name || '';
    return nameA.localeCompare(nameB);
  };
}

/**
 * 연관단어 매칭
 */
const RELATED_KEYWORDS: Record<string, string[]> = {
  '역': ['기차역', '지하철역', '전철역', '역사'],
  '병원': ['의료원', '한방병원', '치과', '요양병원'],
  '학교': ['초등학교', '중학교', '고등학교', '대학교', '대학'],
  '아파트': ['아파트단지', '주공아파트', '현대아파트', '삼성아파트'],
  '시장': ['전통시장', '재래시장', '농산물시장'],
  '공원': ['근린공원', '도시공원', '체육공원'],
  '터미널': ['고속터미널', '시외터미널', '버스터미널'],
  '체육관': ['종합체육관', '실내체육관', '시민체육관'],
  '도서관': ['시립도서관', '구립도서관', '공공도서관'],
  '마트': ['대형마트', '슈퍼마켓', '할인마트', '이마트', '롯데마트', '홈플러스']
};

export function findRelatedKeywords(query: string): string[] {
  const related: string[] = [];
  
  Object.entries(RELATED_KEYWORDS).forEach(([key, values]) => {
    if (query.includes(key)) {
      related.push(...values);
    }
    
    values.forEach(value => {
      if (query.includes(value)) {
        related.push(key, ...values.filter(v => v !== value));
      }
    });
  });
  
  return [...new Set(related)]; // 중복 제거
}

/**
 * 확장된 검색 매칭 (연관단어 포함)
 */
export function matchesWithRelated(text: string, searchQuery: string): boolean {
  // 기본 매칭
  if (getSearchScore(text, searchQuery) > 0) return true;
  
  // 연관단어 매칭
  const relatedKeywords = findRelatedKeywords(searchQuery);
  return relatedKeywords.some(keyword => 
    getSearchScore(text, keyword) > 0
  );
} 