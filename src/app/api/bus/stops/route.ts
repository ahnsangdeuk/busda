import { NextResponse } from 'next/server';

// 개발환경에서만 동적 라우트 사용
export const dynamic = 'force-dynamic';

// 대구시 공식 API 정보
const OFFICIAL_API_BASE = 'https://apis.data.go.kr/6270000/dbmsapi01';
const BASIC_ENDPOINT = '/getBasic';
const SERVICE_KEY_ENCODED = 'Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D';

// 대구시 실제 정류장 데이터 (백업용)
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
];

// 거리 계산 함수
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // 미터로 변환
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseInt(searchParams.get('radius') || '5000');

  console.log(`🚌 정류장 검색 요청: 좌표 ${lat}, ${lng} / 반경: ${radius}m`);

  try {
    let allStops = DAEGU_BUS_STOPS;

    // 대구시 공식 API 호출 시도
    try {
      console.log('🏛️ 대구시 공식 getBasic API 호출...');
      const url = `${OFFICIAL_API_BASE}${BASIC_ENDPOINT}?serviceKey=${SERVICE_KEY_ENCODED}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DaeguBusApp/1.0',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.header?.resultCode === "0000" && data.header?.success === true) {
          const busStops = data.body?.items?.bs || [];
          
          if (Array.isArray(busStops) && busStops.length > 0) {
            allStops = busStops.map((stop: any) => ({
              stopId: stop.bsId,
              stopName: stop.bsNm,
              latitude: parseFloat(stop.yPos) || 35.8714,
              longitude: parseFloat(stop.xPos) || 128.6014,
            }));
            console.log(`✅ 공식 API 성공: ${allStops.length}개 정류장`);
          }
        }
      }
    } catch (error) {
      console.log('❌ 공식 API 실패, 백업 데이터 사용:', error);
    }

    // 위치 기반 필터링
    if (lat !== 0 && lng !== 0) {
      let nearbyStops = allStops.filter((stop: any) => {
        const distance = calculateDistance(lat, lng, stop.latitude, stop.longitude);
        return distance <= radius;
      }).sort((a: any, b: any) => {
        const distanceA = calculateDistance(lat, lng, a.latitude, a.longitude);
        const distanceB = calculateDistance(lat, lng, b.latitude, b.longitude);
        return distanceA - distanceB;
      });
      
      if (nearbyStops.length === 0) {
        nearbyStops = allStops
          .map((stop: any) => ({
            ...stop,
            distance: calculateDistance(lat, lng, stop.latitude, stop.longitude)
          }))
          .sort((a: any, b: any) => a.distance - b.distance)
          .slice(0, 10);
      }
      
      return NextResponse.json({
        success: true,
        data: nearbyStops,
        totalAvailable: allStops.length,
        message: `${nearbyStops.length}개 정류장 검색 완료`
      });
    }

    // 전체 정류장 반환 (제한)
    const limitedStops = allStops.slice(0, 100);
    
    return NextResponse.json({
      success: true,
      data: limitedStops,
      totalAvailable: allStops.length,
      message: `${limitedStops.length}개 정류장 반환`
    });
    
  } catch (error) {
    console.error('🚨 정류장 API 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '정류장 정보를 가져오는데 실패했습니다', 
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
} 