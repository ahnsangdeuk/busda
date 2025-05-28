import { NextRequest, NextResponse } from 'next/server';
import { getSearchScore, createSearchComparator, findRelatedKeywords } from '../../../../../../utils/koreanSearch';

interface BusStop {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
  searchScore?: number;
}

// 캐싱 시스템
let cachedStops: BusStop[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30분

async function getAllStops(): Promise<BusStop[]> {
  const now = Date.now();
  
  // 캐시된 데이터가 유효하면 반환
  if (cachedStops.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedStops;
  }

  try {
    console.log('🔍 전체 정류장 데이터 로드 중...');
    
    // 기본 정류장 API 호출
    const serviceKey = 'Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D';
    const apiUrl = `https://apis.data.go.kr/6270000/dbmsapi01/getBasic?serviceKey=${serviceKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DaeguBusApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status}`);
    }

    const data = await response.json();
    
    // 응답 구조 확인 및 데이터 추출
    if (data.header?.resultCode === "0000" && data.header?.success === true) {
      console.log(`✅ getBasic API 성공: resultCode=0000`);
      
      const busStops = data.body?.items?.bs || [];
      
      if (Array.isArray(busStops) && busStops.length > 0) {
        console.log(`🎯 정류장 데이터 발견: ${busStops.length}개 정류장`);
        
        // API 응답을 표준 형식으로 변환
        const stops: BusStop[] = busStops.map((stop: any) => ({
          stopId: stop.bsId,
          stopName: stop.bsNm,
          latitude: parseFloat(stop.yPos) || 35.8714, // yPos가 위도
          longitude: parseFloat(stop.xPos) || 128.6014, // xPos가 경도
        }));
        
        cachedStops = stops;
        lastFetchTime = now;
        
        console.log(`✅ 전체 정류장 데이터 로드 완료: ${stops.length}개`);
        return stops;
      }
      
      console.log('⚠️ getBasic API에서 정류장 데이터 없음');
    } else {
      const resultCode = data.header?.resultCode || 'UNKNOWN';
      const resultMsg = data.header?.resultMsg || '알 수 없는 오류';
      console.warn(`⚠️ getBasic API 결과 코드: ${resultCode} - ${resultMsg}`);
    }
    
    throw new Error('getBasic API에서 유효한 데이터를 받지 못했습니다');

  } catch (error) {
    console.error('❌ 전체 정류장 데이터 로드 실패:', error);
    
    // 캐시된 데이터가 있으면 반환
    if (cachedStops.length > 0) {
      console.log('💾 캐시된 데이터 사용');
      return cachedStops;
    }
    
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ query: string }> }
) {
  const { query } = await params;
  
  try {
    const searchQuery = decodeURIComponent(query).trim();
    console.log(`🔍 정류장 검색 요청: "${searchQuery}"`);

    if (!searchQuery || searchQuery.length < 1) {
      return NextResponse.json({
        success: false,
        data: [],
        message: '검색어를 입력해주세요.'
      });
    }

    // 전체 정류장 데이터 가져오기
    const allStops = await getAllStops();

    // 1단계: 기본 검색 점수 계산
    const scoredStops = allStops
      .map(stop => ({
        ...stop,
        searchScore: getSearchScore(stop.stopName, searchQuery)
      }))
      .filter(stop => stop.searchScore! > 0);

    // 2단계: 연관단어 검색 (기본 검색에서 결과가 적을 때)
    let finalResults = scoredStops;
    
    if (scoredStops.length < 5) {
      console.log(`🔍 연관단어 검색 시작 (기본 결과: ${scoredStops.length}개)`);
      
      const relatedKeywords = findRelatedKeywords(searchQuery);
      console.log(`🏷️ 연관단어: [${relatedKeywords.join(', ')}]`);
      
      const relatedResults = allStops
        .filter(stop => !scoredStops.some(s => s.stopId === stop.stopId)) // 중복 제거
        .map(stop => {
          let maxScore = 0;
          
          // 연관단어들과 매칭 시도
          relatedKeywords.forEach(keyword => {
            const score = getSearchScore(stop.stopName, keyword);
            if (score > maxScore) {
              maxScore = score;
            }
          });
          
          return {
            ...stop,
            searchScore: maxScore * 0.8 // 연관단어는 점수를 약간 낮춤
          };
        })
        .filter(stop => stop.searchScore! > 0);
      
      finalResults = [...scoredStops, ...relatedResults];
      console.log(`🔍 연관단어 추가 결과: ${relatedResults.length}개`);
    }

    // 3단계: 점수순 정렬 및 상위 결과 선택
    finalResults.sort(createSearchComparator(searchQuery));
    
    const topResults = finalResults.slice(0, 20);

    // 4단계: 검색 결과 분석
    const resultAnalysis = {
      totalFound: finalResults.length,
      exactMatches: finalResults.filter(s => s.searchScore! >= 90).length,
      partialMatches: finalResults.filter(s => s.searchScore! >= 70 && s.searchScore! < 90).length,
      chosungMatches: finalResults.filter(s => s.searchScore! >= 50 && s.searchScore! < 70).length,
      relatedMatches: finalResults.filter(s => s.searchScore! < 50).length
    };

    console.log(`✅ 검색 완료: ${topResults.length}개 결과 반환`);
    console.log(`📊 분석: 정확(${resultAnalysis.exactMatches}) | 부분(${resultAnalysis.partialMatches}) | 초성(${resultAnalysis.chosungMatches}) | 연관(${resultAnalysis.relatedMatches})`);

    return NextResponse.json({
      success: true,
      data: topResults.map(({ searchScore, ...stop }) => stop), // searchScore 제거
      searchQuery,
      resultAnalysis,
      relatedKeywords: findRelatedKeywords(searchQuery),
      totalResults: finalResults.length,
      message: `"${searchQuery}"에 대한 ${topResults.length}개 정류장 검색 완료`
    });

  } catch (error) {
    console.error('❌ 정류장 검색 오류:', error);
    
    return NextResponse.json(
      {
        success: false,
        data: [],
        searchQuery: query,
        error: '정류장 검색에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
} 