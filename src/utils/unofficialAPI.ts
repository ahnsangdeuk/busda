// 비공식 대구버스 API 연동
// GitHub: https://github.com/ilhaera/Daegu-bus-API

const UNOFFICIAL_API_BASE = 'https://daegu-bus-api.herokuapp.com';

interface UnofficialBusStop {
  name: string;
  id: string;
}

interface UnofficialRoute {
  name: string;
  sub: string;
  id: string;
}

interface UnofficialBusArrival {
  버스번호: string;
  현재정류소: string;
  남은정류소: string;
  도착예정소요시간: string;
  방면?: string;
  종료정류소?: string;
  routeName?: string;
}

// 정류장 검색
export async function searchStationsUnofficial(searchText: string): Promise<UnofficialBusStop[]> {
  try {
    const response = await fetch(`${UNOFFICIAL_API_BASE}/station/search/${encodeURIComponent(searchText)}`);
    if (!response.ok) {
      throw new Error(`비공식 API 오류: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('비공식 정류장 검색 오류:', error);
    throw error;
  }
}

// 정류장별 버스 도착 정보
export async function getStationArrivalsUnofficial(stationId: string): Promise<UnofficialBusArrival[]> {
  try {
    const response = await fetch(`${UNOFFICIAL_API_BASE}/station/${stationId}`);
    if (!response.ok) {
      throw new Error(`비공식 API 오류: ${response.status}`);
    }
    const data = await response.json();
    
    // 데이터 구조를 우리 앱에 맞게 변환
    const arrivals: UnofficialBusArrival[] = [];
    data.forEach((route: any) => {
      if (route.bus && route.bus.length > 0) {
        route.bus.forEach((bus: UnofficialBusArrival) => {
          arrivals.push({
            ...bus,
            routeName: route.name
          });
        });
      }
    });
    
    return arrivals;
  } catch (error) {
    console.error('비공식 도착정보 조회 오류:', error);
    throw error;
  }
}

// 노선 검색
export async function searchRoutesUnofficial(searchText: string): Promise<UnofficialRoute[]> {
  try {
    const response = await fetch(`${UNOFFICIAL_API_BASE}/route/search/${encodeURIComponent(searchText)}`);
    if (!response.ok) {
      throw new Error(`비공식 API 오류: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('비공식 노선 검색 오류:', error);
    throw error;
  }
} 