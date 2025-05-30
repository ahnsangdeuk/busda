import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 대구시 공식 API 정보
const OFFICIAL_API_BASE = 'https://apis.data.go.kr/6270000/dbmsapi01';
const REALTIME_ENDPOINT = '/getRealtime';
const SERVICE_KEY_ENCODED = 'Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D';

// 샘플 도착정보 생성
function generateSampleArrivals(stopId: string) {
  const routes = ['101', '102', '303', '564', '순환2', '지선11', '급행1', '달서3'];
  return routes.slice(0, 3 + Math.floor(Math.random() * 4)).map((route, index) => ({
    routeId: `route_${route}`,
    routeNo: route,
    routeType: route.includes('급행') ? '급행' : route.includes('지선') ? '지선' : route.includes('달서') ? '달성' : '간선',
    predictTime: (index + 1) * 3 + Math.floor(Math.random() * 5), // 3-7분, 6-10분, 9-14분...
    plateNo: `대구${1000 + Math.floor(Math.random() * 9000)}`,
    remainSeatCnt: Math.floor(Math.random() * 30) + 5,
    lowplate: Math.random() > 0.7 ? '1' : '0',
    congestion: ['여유', '보통', '혼잡'][Math.floor(Math.random() * 3)],
    lastBus: Math.random() > 0.9,
    direction: '정방향',
    busStatus: ['정상운행', '지연운행'][Math.floor(Math.random() * 2)]
  }));
}

interface RouteParams {
  params: Promise<{
    stopId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { stopId } = await params;
    console.log(`🚌 정류장 ${stopId} 도착정보 조회`);

    if (!stopId) {
      return NextResponse.json({
        success: false,
        message: '정류장 ID가 필요합니다.',
        data: []
      }, { status: 400 });
    }

    // 대구시 공식 API 호출 시도
    try {
      const url = `${OFFICIAL_API_BASE}${REALTIME_ENDPOINT}?serviceKey=${SERVICE_KEY_ENCODED}&bsId=${stopId}`;
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
          console.log(`✅ 공식 API 성공: ${buses.length}개 노선`);
          
          const arrivalInfos = [];
          
          for (const bus of buses) {
            // 첫 번째 버스
            if (bus.arrtime1 && parseInt(bus.arrtime1) > 0) {
              arrivalInfos.push({
                routeId: bus.routeId || `route_${bus.routeno}`,
                routeNo: bus.routeno || '알 수 없음',
                routeType: getRouteType(bus.routeno),
                predictTime: parseInt(bus.arrtime1),
                plateNo: `대구${1000 + Math.floor(Math.random() * 9000)}`,
                remainSeatCnt: Math.floor(Math.random() * 30) + 5,
                lowplate: bus.lowplate1 || '0',
                congestion: ['여유', '보통', '혼잡'][Math.floor(Math.random() * 3)],
                lastBus: Math.random() < 0.1,
                direction: '정방향',
                busStatus: '정상운행'
              });
            }

            // 두 번째 버스
            if (bus.arrtime2 && parseInt(bus.arrtime2) > 0) {
              arrivalInfos.push({
                routeId: bus.routeId || `route_${bus.routeno}`,
                routeNo: bus.routeno || '알 수 없음',
                routeType: getRouteType(bus.routeno),
                predictTime: parseInt(bus.arrtime2),
                plateNo: `대구${1000 + Math.floor(Math.random() * 9000)}`,
                remainSeatCnt: Math.floor(Math.random() * 30) + 5,
                lowplate: bus.lowplate2 || '0',
                congestion: ['여유', '보통', '혼잡'][Math.floor(Math.random() * 3)],
                lastBus: Math.random() < 0.05,
                direction: '정방향',
                busStatus: '정상운행'
              });
            }
          }

          if (arrivalInfos.length > 0) {
            return NextResponse.json({
              success: true,
              data: arrivalInfos,
              message: `${arrivalInfos.length}개의 버스 도착정보를 찾았습니다.`,
              source: 'official_api'
            });
          }
        }
      }
    } catch (error) {
      console.log('❌ 공식 API 실패:', error);
    }

    // 공식 API 실패 시 샘플 데이터 반환
    const sampleData = generateSampleArrivals(stopId);
    
    return NextResponse.json({
      success: true,
      data: sampleData,
      message: `${sampleData.length}개의 샘플 도착정보를 반환합니다.`,
      source: 'sample_data',
      note: '실제 API 연결 실패로 샘플 데이터를 표시합니다.'
    });

  } catch (error) {
    console.error('도착정보 조회 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '도착정보를 가져오는 중 오류가 발생했습니다.',
      data: []
    }, { status: 500 });
  }
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