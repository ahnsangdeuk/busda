'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocation, calculateDistance } from '../utils/locationUtils';

interface BusStop {
  stopId: string;
  stopName: string;
  gpsX: string;
  gpsY: string;
  distance: number;
}

interface BusArrival {
  routeNo: string;
  arrivalTime: string;
  remainingSeatCnt: string;
  currentLocation: string;
  busNumber: string;
}

// 대구시 실제 정류장 데이터 (일부)
const REALISTIC_DAEGU_STOPS = [
  { stopId: '703100', stopName: '대구역', gpsX: '128.625717', gpsY: '35.879741' },
  { stopId: '703200', stopName: '동대구역', gpsX: '128.630063', gpsY: '35.879127' },
  { stopId: '704100', stopName: '경북대정문', gpsX: '128.613201', gpsY: '35.890463' },
  { stopId: '704200', stopName: '계명대정문', gpsX: '128.544007', gpsY: '35.856215' },
  { stopId: '705100', stopName: '서문시장', gpsX: '128.588211', gpsY: '35.874421' },
  { stopId: '705200', stopName: '동성로', gpsX: '128.596946', gpsY: '35.870675' },
  { stopId: '706100', stopName: '범어네거리', gpsX: '128.630752', gpsY: '35.862174' },
  { stopId: '706200', stopName: '수성구청', gpsX: '128.630825', gpsY: '35.858424' },
  { stopId: '707100', stopName: '달서구청', gpsX: '128.532925', gpsY: '35.829835' },
  { stopId: '707200', stopName: '성서네거리', gpsX: '128.515274', gpsY: '35.838172' },
  { stopId: '708100', stopName: '두류공원', gpsX: '128.574923', gpsY: '35.849283' },
  { stopId: '708200', stopName: '앞산공원', gpsX: '128.584722', gpsY: '35.832458' },
  { stopId: '709100', stopName: '중앙로역', gpsX: '128.597865', gpsY: '35.869438' },
  { stopId: '709200', stopName: '반월당역', gpsX: '128.606123', gpsY: '35.857842' },
  { stopId: '710100', stopName: '명덕역', gpsX: '128.624537', gpsY: '35.871946' }
];

// 실제 대구시 버스 노선 (일부)
const REALISTIC_ROUTES = [
  { routeNo: '425', routeName: '동대구역↔성서네거리' },
  { routeNo: '623', routeName: '대구역↔달서구청' },
  { routeNo: '급행1', routeName: '동대구역↔성서산업단지' },
  { routeNo: '급행3', routeName: '동대구역↔경북대' },
  { routeNo: '달성1', routeName: '옥포읍↔달서구청' },
  { routeNo: '706', routeName: '칠곡3지구↔범어네거리' },
  { routeNo: '218', routeName: '동촌↔서문시장' },
  { routeNo: '349', routeName: '평리네거리↔두류공원' },
  { routeNo: '북구1', routeName: '경대병원↔칠곡경대병원' },
  { routeNo: '524', routeName: '동대구역↔수성구청' }
];

// 현실적인 버스 도착 데이터 생성
function generateRealisticArrivals(stopName: string): BusArrival[] {
  const routeCount = Math.floor(Math.random() * 4) + 2; // 2-5개 노선
  const arrivals: BusArrival[] = [];
  
  for (let i = 0; i < routeCount; i++) {
    const route = REALISTIC_ROUTES[Math.floor(Math.random() * REALISTIC_ROUTES.length)];
    const arrivalMinutes = Math.floor(Math.random() * 20) + 1; // 1-20분
    const seats = Math.floor(Math.random() * 30) + 5; // 5-35석
    const busNumber = String(1000 + Math.floor(Math.random() * 9000));
    
    // 현재 위치 생성 (실제 대구 지명 사용)
    const locations = [
      '대구역앞', '동대구역광장', '서문시장입구', '동성로중앙',
      '반월당네거리', '범어역사거리', '수성못', '달서구청앞',
      '성서네거리', '칠곡운암역', '경북대정문', '계명대동산캠퍼스',
      '두류공원정문', '앞산전망대', '김광석길', '근대골목'
    ];
    
    arrivals.push({
      routeNo: route.routeNo,
      arrivalTime: `${arrivalMinutes}분`,
      remainingSeatCnt: `${seats}`,
      currentLocation: locations[Math.floor(Math.random() * locations.length)],
      busNumber: busNumber
    });
  }
  
  return arrivals.sort((a, b) => parseInt(a.arrivalTime) - parseInt(b.arrivalTime));
}

export default function MockBusData() {
  const [nearbyStops, setNearbyStops] = useState<BusStop[]>([]);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [arrivals, setArrivals] = useState<{ [key: string]: BusArrival[] }>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // 즐겨찾기 로드
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteBusStops');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // 즐겨찾기 토글
  const toggleFavorite = useCallback((stopId: string) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(stopId) 
        ? prev.filter(id => id !== stopId)
        : [...prev, stopId];
      localStorage.setItem('favoriteBusStops', JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // 주변 정류장 찾기 (시뮬레이션)
  const fetchNearbyStops = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 사용자 위치 가져오기
      const location = await getCurrentLocation();
      
      // 실제 대구 정류장 데이터 기반으로 거리 계산
      const stopsWithDistance = REALISTIC_DAEGU_STOPS.map(stop => ({
        ...stop,
        distance: Math.round(calculateDistance(
          location.latitude,
          location.longitude,
          parseFloat(stop.gpsY),
          parseFloat(stop.gpsX)
        ))
      }));

      // 거리순 정렬 및 500m 이내 필터링
      const nearby = stopsWithDistance
        .filter(stop => stop.distance <= 500)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 8); // 최대 8개

      setNearbyStops(nearby);
      
      // 각 정류장의 도착 정보 생성
      const newArrivals: { [key: string]: BusArrival[] } = {};
      nearby.forEach(stop => {
        newArrivals[stop.stopId] = generateRealisticArrivals(stop.stopName);
      });
      setArrivals(newArrivals);
      setLastUpdate(new Date());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '위치 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 특정 정류장 도착 정보 새로고침
  const refreshArrivals = (stopId: string) => {
    const stop = nearbyStops.find(s => s.stopId === stopId);
    if (stop) {
      setArrivals(prev => ({
        ...prev,
        [stopId]: generateRealisticArrivals(stop.stopName)
      }));
      setLastUpdate(new Date());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🚌 대구버스 실시간 정보</h2>
        <p className="text-gray-600">현재 위치 기반으로 가까운 정류장과 버스 도착 정보를 확인하세요</p>
        <div className="mt-2 flex justify-center items-center space-x-2">
          <div className="px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
            🧪 데모 모드 (실제 API 서비스 준비 중)
          </div>
          <div className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            📱 실제 대구시 정류장 데이터 기반
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={fetchNearbyStops}
          disabled={loading}
          className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium text-lg transition-colors"
        >
          {loading ? '정류장 검색 중...' : '📍 현재 위치에서 주변 정류장 찾기'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          <h3 className="font-bold">⚠️ 오류 발생:</h3>
          <p>{error}</p>
          <p className="text-sm mt-2">
            💡 위치 정보 접근을 허용하고 다시 시도해주세요.
          </p>
        </div>
      )}

      {favorites.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h3 className="font-bold text-gray-800 mb-2">⭐ 즐겨찾기 정류장</h3>
          <div className="flex flex-wrap gap-2">
            {favorites.map(favoriteId => {
              const favoriteStop = nearbyStops.find(stop => stop.stopId === favoriteId);
              return favoriteStop ? (
                <button
                  key={favoriteId}
                  onClick={() => setSelectedStop(favoriteId)}
                  className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded-full text-sm transition-colors"
                >
                  🚏 {favoriteStop.stopName}
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}

      {nearbyStops.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">
              📍 주변 정류장 {nearbyStops.length}개 찾음
            </h3>
            <p className="text-sm text-gray-500">
              마지막 업데이트: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="grid gap-4">
            {nearbyStops.map((stop) => (
              <div
                key={stop.stopId}
                className={`p-5 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedStop === stop.stopId 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-gray-50'
                }`}
                onClick={() => setSelectedStop(selectedStop === stop.stopId ? null : stop.stopId)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-bold text-lg text-gray-800">🚏 {stop.stopName}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(stop.stopId);
                        }}
                        className={`p-1 rounded-full transition-colors ${
                          favorites.includes(stop.stopId)
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-yellow-500'
                        }`}
                      >
                        {favorites.includes(stop.stopId) ? '⭐' : '☆'}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">정류장 ID: {stop.stopId}</p>
                    <div className="flex items-center space-x-4">
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        📏 {stop.distance}m
                      </span>
                      <span className="text-sm text-gray-500">
                        GPS: {stop.gpsX}, {stop.gpsY}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshArrivals(stop.stopId);
                      }}
                      className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-sm transition-colors"
                    >
                      🔄 새로고침
                    </button>
                    <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                      🚌 도착 정보
                    </button>
                  </div>
                </div>

                {selectedStop === stop.stopId && arrivals[stop.stopId] && (
                  <div className="mt-5 pt-4 border-t-2 border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-bold text-gray-800">🚌 도착 예정 버스</h5>
                      <span className="text-xs text-gray-500">
                        {lastUpdate.toLocaleTimeString()} 기준
                      </span>
                    </div>
                    
                    {arrivals[stop.stopId].length > 0 ? (
                      <div className="space-y-3">
                        {arrivals[stop.stopId].map((arrival, index) => (
                          <div key={index} className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
                            <div className="flex items-center space-x-4">
                              <span className="inline-flex items-center justify-center w-16 h-8 bg-blue-100 text-blue-800 font-bold rounded text-sm">
                                {arrival.routeNo}
                              </span>
                              <div>
                                <div className="font-medium text-gray-800">
                                  ⏰ {arrival.arrivalTime} 후 도착
                                </div>
                                <div className="text-sm text-gray-600">
                                  📍 현재: {arrival.currentLocation}
                                </div>
                                <div className="text-xs text-gray-500">
                                  🚌 차량번호: {arrival.busNumber}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-gray-800">
                                {arrival.remainingSeatCnt}석
                              </div>
                              <div className="text-xs text-gray-500">
                                남은 좌석
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-2">😔</div>
                        <p>현재 도착 예정인 버스가 없습니다.</p>
                        <p className="text-sm mt-1">잠시 후 다시 확인해주세요.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {nearbyStops.length === 0 && !loading && (
        <div className="mt-8 text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">주변 정류장을 찾아보세요</h3>
          <p>위의 버튼을 클릭하여 현재 위치 주변의 버스 정류장을 확인하실 수 있습니다.</p>
          <p className="text-sm mt-2">반경 500m 내의 정류장을 검색합니다.</p>
          <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-orange-800 font-medium">
              🚧 현재는 데모 버전입니다
            </p>
            <p className="text-orange-700 text-sm mt-1">
              실제 대구시 정류장 위치를 기반으로 한 시뮬레이션 데이터입니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 