import { NextRequest, NextResponse } from 'next/server'

interface BusArrival {
  routeId: string;
  routeNo: string;
  stationId: string;
  stationName: string;
  predictTime1: number;
  predictTime2: number;
  remainSeatCnt1: number;
  remainSeatCnt2: number;
  lowplate1: string;
  lowplate2: string;
  plateNo1: string;
  plateNo2: string;
  busStatus1: string;
  busStatus2: string;
  congestion1: string;
  congestion2: string;
  vehicleType1: string;
  vehicleType2: string;
  routeType: string;
  direction: string;
  lastBusFlag1: boolean;
  lastBusFlag2: boolean;
}

// 실제 대구 버스 노선 데이터
const sampleRoutes = [
  '101', '102', '131', '218', '290', '323', '401', '503', '564', '623', '724', '836', '937',
  '급행1', '급행2', '급행3', '급행4', '급행5',
  '서구1', '서구2', '달서1', '달서2', '달서3', '수성1', '수성2', '동구1', '북구1', '북구2',
  '달성1', '달성2', '달성3', '달성4', '달성5'
];

// 차량번호 생성
const generatePlateNo = (): string => {
  const prefixes = ['대구', '경북'];
  const numbers = Math.floor(Math.random() * 9000) + 1000;
  return `${prefixes[Math.floor(Math.random() * prefixes.length)]}${numbers}`;
};

// 혼잡도 상태
const congestionLevels = ['여유', '보통', '혼잡', '매우혼잡'];

// 운행 상태
const busStatuses = ['정상운행', '지연운행', '막차', '회차지연'];

// 차량 타입
const vehicleTypes = ['일반', '저상', '굴절', '전기'];

// 노선 타입 결정
const getRouteType = (routeNo: string): string => {
  if (routeNo.includes('급행')) return '급행';
  if (routeNo.includes('달성')) return '달성';
  if (routeNo.includes('구')) return '지선';
  return '간선';
};

// 샘플 도착 정보 생성
function generateBusArrivals(routeNo: string): BusArrival[] {
  const arrivals: BusArrival[] = [];
  const routeType = getRouteType(routeNo);
  
  // 1-3개의 정류장에서 해당 노선이 운행
  const stationCount = Math.floor(Math.random() * 3) + 1;
  
  for (let i = 0; i < stationCount; i++) {
    const stationId = `DGB${String(Math.floor(Math.random() * 90000) + 10000)}`;
    const stationNames = [
      '달성군민체육관앞', '서부정류장', '대구역', '동대구역', '반월당', 
      '중앙로역', '명덕역', '수성못', '범어역', '시지역',
      '칠곡경대병원', '북구청', '읍내동', '구암동', '평리동',
      '성서공단', '이곡역', '용산역', '죽전역', '화원역'
    ];
    const stationName = stationNames[Math.floor(Math.random() * stationNames.length)];
    
    // 첫 번째 버스 정보
    const predictTime1 = Math.floor(Math.random() * 20) + 1; // 1-20분
    const remainSeatCnt1 = Math.floor(Math.random() * 30);
    const plateNo1 = generatePlateNo();
    const congestion1 = congestionLevels[Math.floor(Math.random() * congestionLevels.length)];
    const busStatus1 = busStatuses[Math.floor(Math.random() * busStatuses.length)];
    const vehicleType1 = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const lastBusFlag1 = Math.random() > 0.9; // 10% 확률로 막차
    
    // 두 번째 버스 정보 (70% 확률로 존재)
    let predictTime2 = 0;
    let remainSeatCnt2 = 0;
    let plateNo2 = '';
    let congestion2 = '';
    let busStatus2 = '';
    let vehicleType2 = '';
    let lastBusFlag2 = false;
    
    if (Math.random() > 0.3) {
      predictTime2 = predictTime1 + Math.floor(Math.random() * 15) + 5; // 첫 번째 버스보다 5-20분 후
      remainSeatCnt2 = Math.floor(Math.random() * 30);
      plateNo2 = generatePlateNo();
      congestion2 = congestionLevels[Math.floor(Math.random() * congestionLevels.length)];
      busStatus2 = busStatuses[Math.floor(Math.random() * busStatuses.length)];
      vehicleType2 = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
      lastBusFlag2 = Math.random() > 0.95; // 5% 확률로 막차
    }
    
    arrivals.push({
      routeId: `DGR${String(Math.floor(Math.random() * 9000) + 1000)}`,
      routeNo,
      stationId,
      stationName,
      predictTime1,
      predictTime2,
      remainSeatCnt1,
      remainSeatCnt2,
      lowplate1: vehicleType1 === '저상' ? 'Y' : 'N',
      lowplate2: vehicleType2 === '저상' ? 'Y' : 'N',
      plateNo1,
      plateNo2,
      busStatus1,
      busStatus2,
      congestion1,
      congestion2,
      vehicleType1,
      vehicleType2,
      routeType,
      direction: Math.random() > 0.5 ? '상행' : '하행',
      lastBusFlag1,
      lastBusFlag2
    });
  }
  
  return arrivals;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const routeNo = searchParams.get('routeNo');

    if (!routeNo) {
      return NextResponse.json({
        success: false,
        data: [],
        message: '노선번호를 입력해주세요.'
      }, { status: 400 });
    }

    console.log(`🚌 버스 도착정보 요청: ${routeNo}번`);

    // 실제 API 호출 시뮬레이션 (0.5-1.5초 대기)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    // 샘플 도착 정보 생성
    const arrivals = generateBusArrivals(routeNo);

    if (arrivals.length === 0) {
      return NextResponse.json({
        success: false,
        data: [],
        message: `${routeNo}번 버스 정보를 찾을 수 없습니다.`
      }, { status: 404 });
    }

    console.log(`✅ ${routeNo}번 버스 도착정보 조회 완료: ${arrivals.length}개 정류장`);

    return NextResponse.json({
      success: true,
      data: arrivals,
      message: `${routeNo}번 버스 도착정보 조회 완료`
    });

  } catch (error: any) {
    console.error('❌ 버스 도착정보 조회 오류:', error);
    
    return NextResponse.json({
      success: false,
      data: [],
      message: `버스 정보 조회 실패: ${error.message}`
    }, { status: 500 });
  }
}
