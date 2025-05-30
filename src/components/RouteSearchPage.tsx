'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BusStop {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface RouteStep {
  type: string;
  content: string;
  time: string;
}

interface RouteResult {
  routeNo: string;
  routeType: string;
  description: string;
  estimatedTime: string;
  transferCount: number;
  walkingTime: string;
  totalFare: number;
  steps: RouteStep[];
}

interface APIResponse {
  success: boolean;
  data: {
    departureStopId: string;
    arrivalStopId: string;
    departureStopName: string;
    arrivalStopName: string;
    totalRoutes: number;
    recommendedPaths: RouteResult[];
    searchTime: string;
  };
  message: string;
}

export default function RouteSearchPage() {
  const [departureQuery, setDepartureQuery] = useState('');
  const [arrivalQuery, setArrivalQuery] = useState('');
  const [departureStops, setDepartureStops] = useState<BusStop[]>([]);
  const [arrivalStops, setArrivalStops] = useState<BusStop[]>([]);
  const [selectedDeparture, setSelectedDeparture] = useState<BusStop | null>(null);
  const [selectedArrival, setSelectedArrival] = useState<BusStop | null>(null);
  const [showDepartureResults, setShowDepartureResults] = useState(false);
  const [showArrivalResults, setShowArrivalResults] = useState(false);
  const [routeResults, setRouteResults] = useState<RouteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRouteInfo, setShowRouteInfo] = useState(false);
  const router = useRouter();

  // 정류장 검색
  const searchStops = async (query: string): Promise<BusStop[]> => {
    if (!query.trim() || query.length < 2) return [];

    try {
      const response = await fetch(`/api/bus/stops/search/${encodeURIComponent(query)}`);
      const result = await response.json();
      return result.success ? result.data.slice(0, 8) : [];
    } catch (error) {
      console.error('정류장 검색 오류:', error);
      return [];
    }
  };

  // 출발지 검색
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (departureQuery.trim()) {
        const stops = await searchStops(departureQuery);
        setDepartureStops(stops);
        setShowDepartureResults(stops.length > 0);
      } else {
        setDepartureStops([]);
        setShowDepartureResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [departureQuery]);

  // 도착지 검색
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (arrivalQuery.trim()) {
        const stops = await searchStops(arrivalQuery);
        setArrivalStops(stops);
        setShowArrivalResults(stops.length > 0);
      } else {
        setArrivalStops([]);
        setShowArrivalResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [arrivalQuery]);

  // 경로 검색 실행
  const handleRouteSearch = async () => {
    if (!selectedDeparture || !selectedArrival) {
      alert('출발지와 도착지를 모두 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bus/route-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departureStopId: selectedDeparture.stopId,
          arrivalStopId: selectedArrival.stopId,
          departureStopName: selectedDeparture.stopName,
          arrivalStopName: selectedArrival.stopName,
        }),
      });

      const result: APIResponse = await response.json();
      if (result.success && result.data.recommendedPaths) {
        setRouteResults(result.data.recommendedPaths);
        setShowRouteInfo(true);
      } else {
        alert(result.message || '경로를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('경로 검색 오류:', error);
      alert('경로 검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 노선 타입별 색상
  const getRouteTypeColor = (routeType: string) => {
    switch (routeType) {
      case '급행': return 'bg-red-600 text-white';
      case '지선': return 'bg-green-600 text-white';
      case '간선': return 'bg-blue-600 text-white';
      case '달성': return 'bg-green-500 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  // 출발지/도착지 바꾸기
  const swapStops = () => {
    const tempQuery = departureQuery;
    const tempStop = selectedDeparture;
    
    setDepartureQuery(arrivalQuery);
    setSelectedDeparture(selectedArrival);
    setArrivalQuery(tempQuery);
    setSelectedArrival(tempStop);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 상단 헤더 */}
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:bg-blue-500 p-2 rounded-lg transition-colors">
              <span className="text-xl">🏠</span>
            </Link>
            <h1 className="text-xl font-bold">🚌 대구버스 통합검색</h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">경로검색</div>
            <div className="font-bold">출발지 → 도착지</div>
          </div>
        </div>
      </header>

      {/* 검색 폼 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-4">
          <div className="grid grid-cols-1 gap-4">
            {/* 출발지 입력 */}
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                <div className="bg-blue-600 text-white px-4 py-3 rounded-l-lg font-bold">
                  출발지
                </div>
                <input
                  type="text"
                  value={departureQuery}
                  onChange={(e) => setDepartureQuery(e.target.value)}
                  placeholder="국가산단서한이다음"
                  className="flex-1 px-4 py-3 focus:outline-none text-lg"
                />
                <button
                  onClick={() => setDepartureQuery('')}
                  className="px-4 py-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {/* 출발지 검색 결과 */}
              {showDepartureResults && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {departureStops.map((stop) => (
                    <div
                      key={stop.stopId}
                      onClick={() => {
                        setSelectedDeparture(stop);
                        setDepartureQuery(stop.stopName);
                        setShowDepartureResults(false);
                      }}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">{stop.stopName}</div>
                      <div className="text-sm text-gray-500">{stop.stopId}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 교환 버튼 */}
            <div className="flex justify-center">
              <button
                onClick={swapStops}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors"
                title="출발지/도착지 바꾸기"
              >
                <span className="text-xl">⇅</span>
              </button>
            </div>

            {/* 도착지 입력 */}
            <div className="relative">
              <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                <div className="bg-red-500 text-white px-4 py-3 rounded-l-lg font-bold">
                  도착지
                </div>
                <input
                  type="text"
                  value={arrivalQuery}
                  onChange={(e) => setArrivalQuery(e.target.value)}
                  placeholder="달서구청건너"
                  className="flex-1 px-4 py-3 focus:outline-none text-lg"
                />
                <button
                  onClick={() => setArrivalQuery('')}
                  className="px-4 py-3 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {/* 도착지 검색 결과 */}
              {showArrivalResults && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                  {arrivalStops.map((stop) => (
                    <div
                      key={stop.stopId}
                      onClick={() => {
                        setSelectedArrival(stop);
                        setArrivalQuery(stop.stopName);
                        setShowArrivalResults(false);
                      }}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">{stop.stopName}</div>
                      <div className="text-sm text-gray-500">{stop.stopId}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 검색 버튼 */}
            <button
              onClick={handleRouteSearch}
              disabled={loading || !selectedDeparture || !selectedArrival}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              {loading ? '검색 중...' : '출도착지 검색'}
            </button>
          </div>
        </div>
      </div>

      {/* 출도착지정보 드롭다운 */}
      {(selectedDeparture || selectedArrival) && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto p-4">
            <button
              onClick={() => setShowRouteInfo(!showRouteInfo)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-bold text-blue-600 text-lg">출도착지정보</span>
              <span className="text-blue-600 text-xl">
                {showRouteInfo ? '▲' : '▼'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 경로 검색 결과 */}
      {showRouteInfo && routeResults.length > 0 && (
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              🚌 추천 경로 {routeResults.length}개
            </h3>
            {routeResults.map((route, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                {/* 노선 헤더 */}
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-800">
                      {route.routeNo}
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-bold ${getRouteTypeColor(route.routeType)}`}>
                      {route.routeType}
                    </span>
                    {route.transferCount > 0 && (
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded text-sm font-bold">
                        {route.transferCount}회 환승
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-gray-600">
                    {route.description}
                  </div>
                </div>

                {/* 경로 정보 */}
                <div className="p-4">
                  <div className="space-y-4">
                    {/* 시간 및 요금 정보 */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{route.estimatedTime}</div>
                        <div className="text-sm text-gray-500">총 소요시간</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{route.walkingTime}</div>
                        <div className="text-sm text-gray-500">도보시간</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{route.totalFare}원</div>
                        <div className="text-sm text-gray-500">총 요금</div>
                      </div>
                    </div>

                    {/* 경로 단계 */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">경로 안내</h4>
                      {route.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            step.type === '도보' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                          }`}>
                            {stepIndex + 1}
                          </span>
                          <div className="flex-1">
                            <span className="text-sm font-medium">{step.content}</span>
                          </div>
                          <span className="text-sm text-gray-500">{step.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 결과 없음 */}
      {showRouteInfo && routeResults.length === 0 && !loading && (
        <div className="max-w-4xl mx-auto p-8 text-center">
          <div className="text-4xl mb-4">🚫</div>
          <div className="text-xl font-bold text-gray-600 mb-2">경로를 찾을 수 없습니다</div>
          <div className="text-gray-500">다른 출발지와 도착지를 시도해보세요.</div>
        </div>
      )}

      {/* 하단 정보 */}
      <footer className="bg-blue-600 text-white text-center py-6 mt-8">
        <div className="text-sm">
          <p>대구광역시 버스정보시스템 | 경로 검색 서비스</p>
          <p className="mt-2 text-blue-200">daegu.go.kr</p>
        </div>
      </footer>
    </div>
  );
} 