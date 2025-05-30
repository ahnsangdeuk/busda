import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 대구시 공식 API 정보
const OFFICIAL_API_BASE = 'https://apis.data.go.kr/6270000/dbmsapi01';
const BASIC_ENDPOINT = '/getBasic';
const SERVICE_KEY_ENCODED = 'Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D';

// 백업 정류장 데이터
const DAEGU_BUS_STOPS = [
  { stopId: "22001001", stopName: "대구역", latitude: 35.8814, longitude: 128.6250 },
  { stopId: "22001002", stopName: "중앙로역", latitude: 35.8682, longitude: 128.6060 },
  { stopId: "22001003", stopName: "반월당역", latitude: 35.8583, longitude: 128.5928 },
  { stopId: "22001004", stopName: "명덕역", latitude: 35.8533, longitude: 128.5947 },
  { stopId: "22001005", stopName: "청라언덕역", latitude: 35.8475, longitude: 128.5975 },
  { stopId: "22001006", stopName: "신천대역", latitude: 35.8408, longitude: 128.6003 },
  { stopId: "22001007", stopName: "동대구역", latitude: 35.8797, longitude: 128.6286 },
  { stopId: "22001008", stopName: "팔공산", latitude: 35.9500, longitude: 128.6833 },
  { stopId: "22001009", stopName: "서구청", latitude: 35.8718, longitude: 128.5592 },
  { stopId: "22001010", stopName: "달서구청", latitude: 35.8306, longitude: 128.5356 },
  { stopId: "22001011", stopName: "수성구청", latitude: 35.8581, longitude: 128.6306 },
  { stopId: "22001012", stopName: "북구청", latitude: 35.8850, longitude: 128.5828 },
  { stopId: "22001013", stopName: "동구청", latitude: 35.8886, longitude: 128.6350 },
  { stopId: "22001014", stopName: "중구청", latitude: 35.8692, longitude: 128.6064 },
  { stopId: "22001015", stopName: "달성군청", latitude: 35.7750, longitude: 128.4306 },
  // 인기 노선 관련 정류장들
  { stopId: "22001101", stopName: "101번 기점", latitude: 35.8700, longitude: 128.6000 },
  { stopId: "22001102", stopName: "102번 기점", latitude: 35.8650, longitude: 128.6100 },
  { stopId: "22001103", stopName: "급행1 기점", latitude: 35.8600, longitude: 128.6200 },
  { stopId: "22001104", stopName: "급행2 기점", latitude: 35.8550, longitude: 128.6300 },
  { stopId: "22001105", stopName: "달서1 기점", latitude: 35.8300, longitude: 128.5400 },
  { stopId: "22001106", stopName: "수성1 기점", latitude: 35.8500, longitude: 128.6400 },
];

// 텍스트 유사도 계산 (간단한 부분 문자열 매칭)
function calculateSimilarity(query: string, targetName: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerTarget = targetName.toLowerCase();
  
  // 완전 일치
  if (lowerTarget === lowerQuery) return 100;
  
  // 시작 문자 일치
  if (lowerTarget.startsWith(lowerQuery)) return 90;
  
  // 포함 관계
  if (lowerTarget.includes(lowerQuery)) return 70;
  
  // 초성 검색 지원 (간단 버전)
  const chosung = extractChosung(lowerTarget);
  if (chosung.includes(lowerQuery)) return 50;
  
  return 0;
}

// 초성 추출 (간단 버전)
function extractChosung(text: string): string {
  const chosungList = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  let result = '';
  
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    if (char >= 44032 && char <= 55203) {
      const chosungIndex = Math.floor((char - 44032) / 588);
      result += chosungList[chosungIndex];
    }
  }
  
  return result;
}

interface RouteParams {
  params: Promise<{
    query: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { query } = await params;
    const decodedQuery = decodeURIComponent(query);
    
    console.log(`🔍 정류장 검색 요청: "${decodedQuery}"`);

    if (!decodedQuery.trim()) {
      return NextResponse.json({
        success: false,
        message: '검색어를 입력해주세요.',
        data: []
      }, { status: 400 });
    }

    let allStops = DAEGU_BUS_STOPS;

    // 대구시 공식 API 호출 시도
    try {
      const url = `${OFFICIAL_API_BASE}${BASIC_ENDPOINT}?serviceKey=${SERVICE_KEY_ENCODED}`;
      console.log(`📡 공식 API 호출: ${url}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DaeguBusApp/1.0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.header?.resultCode === "0000" && data.body?.items?.bs) {
          const busStops = data.body.items.bs;
          allStops = busStops.map((stop: any) => ({
            stopId: stop.bsId,
            stopName: stop.bsNm,
            latitude: parseFloat(stop.yPos) || 35.8714,
            longitude: parseFloat(stop.xPos) || 128.6014,
          }));
          console.log(`✅ 공식 API 성공: ${allStops.length}개 정류장`);
        }
      }
    } catch (error) {
      console.log('❌ 공식 API 실패, 백업 데이터 사용:', error);
    }

    // 검색 수행
    const searchResults = allStops
      .map((stop: any) => ({
        ...stop,
        similarity: calculateSimilarity(decodedQuery, stop.stopName)
      }))
      .filter((stop: any) => stop.similarity > 0)
      .sort((a: any, b: any) => b.similarity - a.similarity)
      .slice(0, 20); // 상위 20개만 반환

    // 결과 분석
    const exactMatches = searchResults.filter((stop: any) => stop.similarity === 100).length;
    const partialMatches = searchResults.filter((stop: any) => stop.similarity >= 70 && stop.similarity < 100).length;
    const chosungMatches = searchResults.filter((stop: any) => stop.similarity >= 50 && stop.similarity < 70).length;

    const resultAnalysis = {
      totalFound: searchResults.length,
      exactMatches,
      partialMatches,
      chosungMatches,
      relatedMatches: searchResults.length - exactMatches - partialMatches - chosungMatches
    };

    return NextResponse.json({
      success: true,
      data: searchResults.map(({ similarity, ...stop }) => stop), // similarity 제거
      searchQuery: decodedQuery,
      resultAnalysis,
      totalResults: searchResults.length,
      message: `"${decodedQuery}"에 대한 ${searchResults.length}개의 검색 결과를 찾았습니다.`,
      source: allStops === DAEGU_BUS_STOPS ? 'backup_data' : 'official_api'
    });

  } catch (error) {
    console.error('검색 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '검색 중 오류가 발생했습니다.',
      data: []
    }, { status: 500 });
  }
} 