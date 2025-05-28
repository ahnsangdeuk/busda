'use client';

import React, { useState, useEffect } from 'react';

interface RouteInfo {
  routeNo: string;
  routeType: 'main' | 'branch' | 'express'; // 간선, 지선, 급행
  routeName: string;
  startStop: string;
  endStop: string;
  totalTime: number; // 분 단위
  totalStops: number;
  transfers: number;
  fare: number;
  color: string;
}

interface SearchRoute {
  totalTime: number;
  totalTransfers: number;
  routes: RouteInfo[];
}

export default function BusRouteSearch() {
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [searchResults, setSearchResults] = useState<SearchRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // 실제로는 좌표를 주소로 변환해야 하지만, 여기서는 샘플 데이터 사용
          setDeparture('학산리');
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          setDeparture('현재위치');
        }
      );
    }
  };

  // 출발지/도착지 바꾸기
  const swapLocations = () => {
    const temp = departure;
    setDeparture(destination);
    setDestination(temp);
  };

  // 샘플 노선 검색 결과 생성
  const generateSampleResults = (dep: string, dest: string): SearchRoute[] => {
    return [
      {
        totalTime: 133,
        totalTransfers: 1,
        routes: [
          {
            routeNo: '665',
            routeType: 'main',
            routeName: '달성2차산단-대전동',
            startStop: '화산본동2번지',
            endStop: '한남중미용정보고등학교와',
            totalTime: 73,
            totalStops: 53,
            transfers: 0,
            fare: 1500,
            color: 'blue'
          },
          {
            routeNo: '달서3',
            routeType: 'branch',
            routeName: '달서구 지선',
            startStop: '한남중미용정보고등학교와',
            endStop: '1차서화성타운2번지',
            totalTime: 60,
            totalStops: 41,
            transfers: 1,
            fare: 1500,
            color: 'green'
          }
        ]
      },
      {
        totalTime: 98,
        totalTransfers: 0,
        routes: [
          {
            routeNo: '급행1',
            routeType: 'express',
            routeName: '동대구역-성서공단',
            startStop: dep,
            endStop: dest,
            totalTime: 98,
            totalStops: 28,
            transfers: 0,
            fare: 2000,
            color: 'red'
          }
        ]
      },
      {
        totalTime: 145,
        totalTransfers: 2,
        routes: [
          {
            routeNo: '101',
            routeType: 'main',
            routeName: '대구역-동구청',
            startStop: dep,
            endStop: '중앙로',
            totalTime: 45,
            totalStops: 18,
            transfers: 0,
            fare: 1500,
            color: 'blue'
          },
          {
            routeNo: '순환2',
            routeType: 'branch',
            routeName: '순환노선',
            startStop: '중앙로',
            endStop: '서구청',
            totalTime: 55,
            totalStops: 22,
            transfers: 1,
            fare: 1500,
            color: 'green'
          },
          {
            routeNo: '달서1',
            routeType: 'branch',
            routeName: '달서구청-성서',
            startStop: '서구청',
            endStop: dest,
            totalTime: 45,
            totalStops: 15,
            transfers: 1,
            fare: 1500,
            color: 'green'
          }
        ]
      }
    ];
  };

  // 노선 검색 실행
  const handleSearch = async () => {
    if (!departure.trim() || !destination.trim()) {
      setError('출발지와 도착지를 모두 입력해주세요.');
      return;
    }

    if (departure === destination) {
      setError('출발지와 도착지가 같습니다.');
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      // 실제 API 호출
      const response = await fetch('/api/bus/route-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          departure: departure.trim(),
          destination: destination.trim()
        })
      });

      const result = await response.json();

      if (result.success && result.data) {
        setSearchResults(result.data);
      } else {
        throw new Error(result.message || '노선 검색에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('노선 검색 오류:', err);
      setError(err.message || '노선 검색 중 오류가 발생했습니다.');
      
      // 오류 시 샘플 데이터 사용
      const results = generateSampleResults(departure, destination);
      setSearchResults(results);
    } finally {
      setLoading(false);
    }
  };

  // 노선 타입별 배지 스타일
  const getRouteTypeBadge = (type: RouteInfo['routeType']) => {
    switch (type) {
      case 'main':
        return 'bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium';
      case 'branch':
        return 'bg-green-500 text-white px-2 py-1 rounded text-xs font-medium';
      case 'express':
        return 'bg-red-500 text-white px-2 py-1 rounded text-xs font-medium';
      default:
        return 'bg-gray-500 text-white px-2 py-1 rounded text-xs font-medium';
    }
  };

  const getRouteTypeText = (type: RouteInfo['routeType']) => {
    switch (type) {
      case 'main': return '간선';
      case 'branch': return '지선';
      case 'express': return '급행';
      default: return '일반';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="text-white hover:bg-blue-500 p-2 rounded-full">
              🏠
            </button>
            <h1 className="text-xl font-bold">대구버스 통합검색</h1>
            <button className="bg-blue-500 p-2 rounded-full hover:bg-blue-400">
              ⚙️
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 출발지/도착지 입력 */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          {/* 출발지 */}
          <div className="flex items-center mb-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-blue-600 text-sm font-medium">출발지</span>
              <span className="text-gray-400">|</span>
              <button
                onClick={getCurrentLocation}
                className="text-blue-600 text-sm hover:underline"
              >
                내위치
              </button>
              <span className="text-gray-400">:</span>
              <input
                type="text"
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                placeholder="출발지를 입력하세요"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setDeparture('')}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              🔍
            </button>
          </div>

          {/* 방향 바꾸기 버튼 */}
          <div className="flex justify-center mb-3">
            <button
              onClick={swapLocations}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
            >
              ⇅
            </button>
          </div>

          {/* 도착지 */}
          <div className="flex items-center mb-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-red-600 text-sm font-medium">도착지</span>
              <span className="text-gray-400">|</span>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="도착지를 입력하세요"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setDestination('')}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* 검색 버튼 */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 disabled:bg-gray-400 transition-colors"
          >
            {loading ? '검색 중...' : '출도착지 검색'}
          </button>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center text-red-800">
              <span className="text-lg mr-2">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* 로딩 상태 */}
        {loading && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">최적 경로를 찾고 있습니다...</p>
          </div>
        )}

        {/* 검색 결과 */}
        {hasSearched && !loading && searchResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* 출도착지정보 헤더 */}
            <div className="bg-blue-50 p-4 border-b">
              <h3 className="text-lg font-semibold text-blue-800">📍 출도착지정보</h3>
              <div className="text-sm text-gray-600 mt-1">
                {departure} → {destination}
              </div>
            </div>

            {/* 검색 결과 목록 */}
            <div className="p-4">
              {searchResults.map((route, index) => (
                <div key={index} className="mb-6 last:mb-0">
                  {/* 총 소요시간 */}
                  <div className="mb-3">
                    <h4 className="text-lg font-bold text-gray-800">
                      함승 {route.totalTime}분
                      {route.totalTransfers > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          (환승 {route.totalTransfers}회)
                        </span>
                      )}
                    </h4>
                  </div>

                  {/* 노선 정보 */}
                  <div className="space-y-3">
                    {route.routes.map((busRoute, routeIndex) => (
                      <div key={routeIndex} className="border rounded-lg p-4">
                        {/* 노선번호와 타입 */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className={getRouteTypeBadge(busRoute.routeType)}>
                            {getRouteTypeText(busRoute.routeType)}
                          </div>
                          <div className="bg-blue-600 text-white px-3 py-1 rounded font-bold">
                            {busRoute.routeNo}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({busRoute.routeName})
                          </span>
                        </div>

                        {/* 정류장 정보 */}
                        <div className="mb-2">
                          <div className="flex items-center text-sm">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            <span className="font-medium">{busRoute.startStop}</span>
                          </div>
                          {busRoute.transfers > 0 && (
                            <div className="ml-4 my-1 text-xs text-red-600">
                              ↓ 환승
                            </div>
                          )}
                          <div className="flex items-center text-sm">
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            <span className="font-medium">{busRoute.endStop}</span>
                          </div>
                        </div>

                        {/* 소요시간 및 정류장 수 */}
                        <div className="text-sm text-gray-600">
                          소요시간: {busRoute.totalTime}분, {busRoute.totalStops}개소
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* 하단 안내 */}
            <div className="bg-gray-50 p-3 text-center border-t">
              <p className="text-xs text-gray-600">
                ※ 교통상황에 따라 소요시간이 달라질 수 있습니다
              </p>
              <p className="text-xs text-gray-500 mt-1">
                문의: 대구시 교통정보운영과 ☎ 053-803-6861
              </p>
            </div>
          </div>
        )}

        {/* 검색 결과 없음 */}
        {hasSearched && !loading && searchResults.length === 0 && !error && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">🚌</div>
            <p className="text-gray-600 mb-2">해당 경로의 버스 노선을 찾을 수 없습니다.</p>
            <p className="text-sm text-gray-500">다른 출발지나 도착지를 시도해보세요.</p>
          </div>
        )}
      </div>
    </div>
  );
} 