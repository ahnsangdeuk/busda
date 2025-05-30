import { NextRequest, NextResponse } from 'next/server';

// API 라우트를 동적으로 설정 (정적 export와 호환)
export const dynamic = 'force-dynamic';

interface RouteSearchRequest {
  departureStopId: string;
  arrivalStopId: string;
  departureStopName: string;
  arrivalStopName: string;
}

interface RouteInfo {
  routeNo: string;
  routeType: string;
  departureStop: string;
  arrivalStop: string;
  travelTime: number;
  stopsCount: number;
  totalDistance: number;
  transferCount: number;
  fare: number;
}

interface RouteSearchResult {
  success: boolean;
  data: RouteInfo[];
  departureStop: string;
  arrivalStop: string;
  totalRoutes: number;
  message: string;
}

// 노선 타입별 실제 대구 버스 노선 데이터
const sampleRoutes = {
  급행: ['급행1', '급행2', '급행3', '급행4', '급행5'],
  지선: ['서구1', '서구2', '달서1', '달서2', '달서3', '수성1', '수성2', '동구1', '북구1', '북구2'],
  간선: ['101', '102', '131', '218', '290', '323', '401', '503', '564', '623', '724', '836', '937'],
  달성: ['달성1', '달성2', '달성3', '달성4', '달성5']
};

// 샘플 노선 데이터 생성 함수
function generateRouteResults(departureStop: string, arrivalStop: string): RouteInfo[] {
  const routes: RouteInfo[] = [];
  
  // 급행 노선 (빠른 경로)
  if (Math.random() > 0.3) {
    const routeNo = sampleRoutes.급행[Math.floor(Math.random() * sampleRoutes.급행.length)];
    routes.push({
      routeNo,
      routeType: '급행',
      departureStop: `${departureStop.replace('건너', '')}`,
      arrivalStop: `${arrivalStop.replace('건너', '')}`,
      travelTime: Math.floor(Math.random() * 15) + 5, // 5-20분
      stopsCount: Math.floor(Math.random() * 5) + 3, // 3-7개소
      totalDistance: Math.floor(Math.random() * 20) + 5, // 5-25km
      transferCount: 0,
      fare: 2000
    });
  }
  
  // 간선 노선 (일반 경로)
  if (Math.random() > 0.2) {
    const routeNo = sampleRoutes.간선[Math.floor(Math.random() * sampleRoutes.간선.length)];
    routes.push({
      routeNo,
      routeType: '간선',
      departureStop: departureStop,
      arrivalStop: arrivalStop,
      travelTime: Math.floor(Math.random() * 25) + 15, // 15-40분
      stopsCount: Math.floor(Math.random() * 15) + 8, // 8-22개소
      totalDistance: Math.floor(Math.random() * 30) + 10, // 10-40km
      transferCount: 0,
      fare: 1500
    });
  }
  
  // 지선 노선 (세부 경로)
  if (Math.random() > 0.4) {
    const routeNo = sampleRoutes.지선[Math.floor(Math.random() * sampleRoutes.지선.length)];
    routes.push({
      routeNo,
      routeType: '지선',
      departureStop: departureStop,
      arrivalStop: arrivalStop,
      travelTime: Math.floor(Math.random() * 20) + 10, // 10-30분
      stopsCount: Math.floor(Math.random() * 10) + 5, // 5-14개소
      totalDistance: Math.floor(Math.random() * 15) + 5, // 5-20km
      transferCount: 0,
      fare: 1300
    });
  }
  
  // 달성 노선 (외곽 지역)
  if (Math.random() > 0.6) {
    const routeNo = sampleRoutes.달성[Math.floor(Math.random() * sampleRoutes.달성.length)];
    routes.push({
      routeNo,
      routeType: '달성',
      departureStop: departureStop,
      arrivalStop: arrivalStop,
      travelTime: Math.floor(Math.random() * 35) + 20, // 20-55분
      stopsCount: Math.floor(Math.random() * 20) + 10, // 10-29개소
      totalDistance: Math.floor(Math.random() * 40) + 15, // 15-55km
      transferCount: 0,
      fare: 1500
    });
  }

  // 환승 경로 (1번 환승)
  if (routes.length < 2) {
    const firstRoute = sampleRoutes.간선[Math.floor(Math.random() * sampleRoutes.간선.length)];
    const secondRoute = sampleRoutes.지선[Math.floor(Math.random() * sampleRoutes.지선.length)];
    
    routes.push({
      routeNo: `${firstRoute}→${secondRoute}`,
      routeType: '환승',
      departureStop: departureStop,
      arrivalStop: arrivalStop,
      travelTime: Math.floor(Math.random() * 45) + 30, // 30-75분
      stopsCount: Math.floor(Math.random() * 25) + 15, // 15-39개소
      totalDistance: Math.floor(Math.random() * 35) + 20, // 20-55km
      transferCount: 1,
      fare: 1500
    });
  }

  // 시간순 정렬
  return routes.sort((a, b) => a.travelTime - b.travelTime);
}

export async function POST(request: NextRequest) {
  try {
    const body: RouteSearchRequest = await request.json();
    const { departureStopId, arrivalStopId, departureStopName, arrivalStopName } = body;

    // 입력 유효성 검사
    if (!departureStopId || !arrivalStopId || !departureStopName || !arrivalStopName) {
      return NextResponse.json({
        success: false,
        data: [],
        departureStop: '',
        arrivalStop: '',
        totalRoutes: 0,
        message: '출발지와 도착지 정보가 불완전합니다.'
      }, { status: 400 });
    }

    if (departureStopId === arrivalStopId) {
      return NextResponse.json({
        success: false,
        data: [],
        departureStop: departureStopName,
        arrivalStop: arrivalStopName,
        totalRoutes: 0,
        message: '출발지와 도착지가 같습니다.'
      }, { status: 400 });
    }

    console.log(`🗺️ 경로 검색 요청: ${departureStopName}(${departureStopId}) → ${arrivalStopName}(${arrivalStopId})`);

    // 실제 API 호출 시뮬레이션 (1-2초 대기)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000));

    // 샘플 결과 생성
    const results = generateRouteResults(departureStopName, arrivalStopName);

    console.log(`✅ 경로 검색 완료: ${results.length}개 노선 발견`);

    return NextResponse.json({
      success: true,
      data: results,
      departureStop: departureStopName,
      arrivalStop: arrivalStopName,
      totalRoutes: results.length,
      message: `${departureStopName}에서 ${arrivalStopName}까지의 노선 ${results.length}개 조회 완료`
    });

  } catch (error: any) {
    console.error('❌ 경로 검색 오류:', error);
    
    return NextResponse.json({
      success: false,
      data: [],
      departureStop: '',
      arrivalStop: '',
      totalRoutes: 0,
      message: `경로 검색 실패: ${error.message}`
    }, { status: 500 });
  }
}

// GET 요청도 지원 (기존 호환성)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const departure = searchParams.get('departure') || '';
    const destination = searchParams.get('destination') || '';

    if (!departure || !destination) {
      return NextResponse.json({
        success: false,
        data: [],
        departureStop: '',
        arrivalStop: '',
        totalRoutes: 0,
        message: '출발지와 도착지를 모두 입력해주세요.'
      }, { status: 400 });
    }

    console.log(`🗺️ 경로 검색 요청 (GET): ${departure} → ${destination}`);

    const results = generateRouteResults(departure, destination);

    return NextResponse.json({
      success: true,
      data: results,
      departureStop: departure,
      arrivalStop: destination,
      totalRoutes: results.length,
      message: `${departure}에서 ${destination}까지의 노선 ${results.length}개 조회 완료`
    });

  } catch (error: any) {
    console.error('❌ 경로 검색 오류 (GET):', error);
    
    return NextResponse.json({
      success: false,
      data: [],
      departureStop: '',
      arrivalStop: '',
      totalRoutes: 0,
      message: `경로 검색 실패: ${error.message}`
    }, { status: 500 });
  }
} 