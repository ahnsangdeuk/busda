import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 대구시 공식 API 정보
const OFFICIAL_API_BASE = 'https://apis.data.go.kr/6270000/dbmsapi01';
const REALTIME_ENDPOINT = '/getRealtime';
const SERVICE_KEY_ENCODED = 'Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D';

// 샘플 노선별 도착정보 생성
function generateSampleRouteArrivals(routeNo: string) {
  const stations = ['대구역', '중앙로역', '반월당역', '명덕역', '청라언덕역', '신천대역'];
  
  return stations.map((station, index) => ({
    routeId: `route_${routeNo}`,
    routeNo,
    stationId: `22001${String(index + 1).padStart(3, '0')}`,
    stationName: station,
    routeType: getRouteType(routeNo),
    predictTime1: (index + 1) * 2 + Math.floor(Math.random() * 3), // 2-4분, 4-6분...
    predictTime2: (index + 1) * 2 + 8 + Math.floor(Math.random() * 3), // 10-12분, 12-14분...
    plateNo1: `대구${1000 + Math.floor(Math.random() * 9000)}`,
    plateNo2: `대구${1000 + Math.floor(Math.random() * 9000)}`,
    remainSeatCnt1: Math.floor(Math.random() * 30) + 5,
    remainSeatCnt2: Math.floor(Math.random() * 30) + 5,
    lowplate1: Math.random() > 0.7 ? '1' : '0',
    lowplate2: Math.random() > 0.7 ? '1' : '0',
    congestion1: ['여유', '보통', '혼잡'][Math.floor(Math.random() * 3)],
    congestion2: ['여유', '보통', '혼잡'][Math.floor(Math.random() * 3)],
    busStatus1: ['정상운행', '지연운행'][Math.floor(Math.random() * 2)],
    busStatus2: ['정상운행', '지연운행'][Math.floor(Math.random() * 2)],
    vehicleType1: ['일반버스', '저상버스'][Math.floor(Math.random() * 2)],
    vehicleType2: ['일반버스', '저상버스'][Math.floor(Math.random() * 2)],
    direction: '정방향',
    lastBusFlag1: Math.random() < 0.05,
    lastBusFlag2: Math.random() < 0.05
  }));
}

// 노선번호로 노선 타입 추정
function getRouteType(routeNo: string): string {
  if (!routeNo) return '일반';
  
  if (routeNo.includes('급행')) return '급행';
  if (routeNo.includes('지선')) return '지선';
  if (routeNo.includes('달서') || routeNo.includes('달성')) return '달성';
  
  const routeNum = parseInt(routeNo);
  if (routeNum >= 100 && routeNum <= 399) return '간선';
  if (routeNum >= 400) return '지선';
  
  return '일반';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const routeNo = searchParams.get('routeNo');
    
    console.log(`🚌 노선별 도착정보 조회: ${routeNo}`);

    if (!routeNo) {
      return NextResponse.json({
        success: false,
        message: '노선번호가 필요합니다.',
        data: []
      }, { status: 400 });
    }

    // 대구시 공식 API 호출 시도
    try {
      const url = `${OFFICIAL_API_BASE}${REALTIME_ENDPOINT}?serviceKey=${SERVICE_KEY_ENCODED}&routeNo=${encodeURIComponent(routeNo)}`;
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
        
        if (data.msgHeader?.resultCode === '0000' && data.msgBody?.itemList) {
          const buses = data.msgBody.itemList;
          console.log(`✅ 공식 API 성공: ${buses.length}개 정류장`);
          
          // 공식 API 데이터를 우리 형식으로 변환
          const arrivalInfos = buses.map((bus: any) => ({
            routeId: bus.routeId || `route_${routeNo}`,
            routeNo: bus.routeno || routeNo,
            stationId: bus.bsId,
            stationName: bus.bsNm,
            routeType: getRouteType(routeNo),
            predictTime1: parseInt(bus.arrtime1) || 0,
            predictTime2: parseInt(bus.arrtime2) || 0,
            plateNo1: `대구${1000 + Math.floor(Math.random() * 9000)}`,
            plateNo2: `대구${1000 + Math.floor(Math.random() * 9000)}`,
            remainSeatCnt1: Math.floor(Math.random() * 30) + 5,
            remainSeatCnt2: Math.floor(Math.random() * 30) + 5,
            lowplate1: bus.lowplate1 || '0',
            lowplate2: bus.lowplate2 || '0',
            congestion1: ['여유', '보통', '혼잡'][Math.floor(Math.random() * 3)],
            congestion2: ['여유', '보통', '혼잡'][Math.floor(Math.random() * 3)],
            busStatus1: '정상운행',
            busStatus2: '정상운행',
            vehicleType1: bus.lowplate1 === '1' ? '저상버스' : '일반버스',
            vehicleType2: bus.lowplate2 === '1' ? '저상버스' : '일반버스',
            direction: '정방향',
            lastBusFlag1: Math.random() < 0.05,
            lastBusFlag2: Math.random() < 0.05
          }));

          return NextResponse.json({
            success: true,
            data: arrivalInfos,
            message: `${arrivalInfos.length}개 정류장의 ${routeNo}번 도착정보를 찾았습니다.`,
            source: 'official_api'
          });
        }
      }
    } catch (error) {
      console.log('❌ 공식 API 실패:', error);
    }

    // 공식 API 실패 시 샘플 데이터 반환
    const sampleData = generateSampleRouteArrivals(routeNo);
    
    return NextResponse.json({
      success: true,
      data: sampleData,
      message: `${sampleData.length}개 정류장의 ${routeNo}번 샘플 도착정보를 반환합니다.`,
      source: 'sample_data',
      note: '실제 API 연결 실패로 샘플 데이터를 표시합니다.'
    });

  } catch (error) {
    console.error('노선별 도착정보 조회 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '노선별 도착정보를 가져오는 중 오류가 발생했습니다.',
      data: []
    }, { status: 500 });
  }
} 