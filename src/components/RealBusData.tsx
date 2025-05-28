'use client';

import React, { useState, useEffect } from 'react';
import { useBusAPI } from '../hooks/useBusAPI';
import { calculateDistance } from '../utils/locationUtils';
import BusStopCard from './BusStopCard';
import BusStopSearch from './BusStopSearch';
import BusArrivalCard from './BusArrivalCard';
import BusSchedule from './BusSchedule';
import ApiStatusDashboard from './ApiStatusDashboard';
import dynamic from 'next/dynamic';
import BusNotificationService from './BusNotificationService';
import RealTimeClock from './RealTimeClock';
import NearbyStops from './NearbyStops';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// SSR을 비활성화하여 Hydration 오류 방지
const RealTimeClockComponent = dynamic(() => import('./RealTimeClock'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse bg-gray-200 h-6 w-32 rounded"></div>
  )
});

// 브라우저 API(Notification, AudioContext)를 사용하므로 클라이언트에서만 로드
const BusNotificationServiceComponent = dynamic(() => import('./BusNotificationService'), {
  ssr: false,
  loading: () => (
    <div className="text-xs text-gray-500">알림 서비스 로딩 중...</div>
  )
});

interface BusStopWithDistance {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
  distance: number;
}

interface BusArrival {
  routeNo: string;
  arrivalTime: string;
  remainingSeatCnt: string;
  currentLocation: string;
  busNumber: string;
  isRealTime: boolean;
  busType?: string;
  routeId?: string;
  moveDir?: string;
}

interface ApiResponse {
  success: boolean;
  data: BusArrival[];
  source: string;
  message: string;
}

export default function RealBusData() {
  const { stops, arrivals, loading, error, apiMode, apiMessage, apiWarning, refreshData, fetchArrivals } = useBusAPI(5000);
  const searchParams = useSearchParams();

  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [stopsWithDistance, setStopsWithDistance] = useState<BusStopWithDistance[]>([]);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [selectedView, setSelectedView] = useState<'arrival' | 'route' | 'info'>('arrival');
  
  // 시간표 관련 상태 추가
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedRouteForSchedule, setSelectedRouteForSchedule] = useState<string>('');

  // URL 파라미터 처리
  useEffect(() => {
    const query = searchParams.get('query');
    const stopId = searchParams.get('stopId');
    const stopName = searchParams.get('stopName');

    if (stopId) {
      // 특정 정류장 ID로 직접 검색
      fetchBusArrivalsForStop(stopId);
    } else if (query) {
      // 검색 쿼리가 있으면 자동 검색 (추후 구현)
      console.log('검색 쿼리:', query);
    }
  }, [searchParams]);

  // 즐겨찾기 및 알림 설정 로드
  useEffect(() => {
    const savedFavorites = localStorage.getItem('busFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    const savedNotification = localStorage.getItem('busNotificationEnabled');
    if (savedNotification) {
      setNotificationEnabled(JSON.parse(savedNotification));
    }
  }, []);

  // 정류장에 거리 정보 추가
  useEffect(() => {
    if (stops.length > 0) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        
        const stopsWithDist = stops.map((stop: any) => ({
          ...stop,
          distance: calculateDistance(userLat, userLng, stop.latitude, stop.longitude)
        })).sort((a: any, b: any) => a.distance - b.distance);
        
        setStopsWithDistance(stopsWithDist);
      }, (error) => {
        console.log('위치 정보를 가져올 수 없습니다:', error);
        setStopsWithDistance(stops.map((stop: any) => ({ ...stop, distance: 0 })));
      });
    }
  }, [stops]);

  // 즐겨찾기 토글
  const toggleFavorite = (stopId: string) => {
    const newFavorites = favorites.includes(stopId)
      ? favorites.filter(id => id !== stopId)
      : [...favorites, stopId];
    
    setFavorites(newFavorites);
    localStorage.setItem('busFavorites', JSON.stringify(newFavorites));
  };

  // 정류장 선택 및 도착정보 조회
  const fetchBusArrivalsForStop = async (stopId: string) => {
    setSelectedStop(stopId);
    await fetchArrivals(stopId);
    setLastUpdateTime(new Date());
  };

  // 자동 새로고침 토글
  const toggleAutoRefresh = () => {
    if (autoRefresh) {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
      setAutoRefresh(false);
    } else {
      if (selectedStop) {
        const interval = setInterval(() => {
          fetchArrivals(selectedStop);
        }, 30000);
        setRefreshInterval(interval);
      }
      setAutoRefresh(true);
    }
  };

  // 알림 토글
  const toggleNotification = () => {
    const newValue = !notificationEnabled;
    setNotificationEnabled(newValue);
    localStorage.setItem('busNotificationEnabled', JSON.stringify(newValue));
  };

  // 현재 선택된 정류장 이름 가져오기
  const getCurrentStopName = () => {
    if (!selectedStop) return '';
    const stop = stopsWithDistance.find(s => s.stopId === selectedStop);
    return stop?.stopName || `정류장 ${selectedStop}`;
  };

  // 시간표 보기
  const handleScheduleClick = (routeNo: string) => {
    setSelectedRouteForSchedule(routeNo);
    setShowSchedule(true);
  };

  // 시간표 닫기
  const handleScheduleClose = () => {
    setShowSchedule(false);
    setSelectedRouteForSchedule('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 (실제 앱 스타일) */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="text-white hover:bg-blue-500 p-2 rounded-full transition-colors">
                🏠
              </button>
            </Link>
            <h1 className="text-xl font-bold">🚌 대구버스 통합검색</h1>
            <button className="bg-blue-500 p-2 rounded-full hover:bg-blue-400">
              ⚙️
            </button>
          </div>
          <RealTimeClockComponent />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* 정류장 검색 */}
        <BusStopSearch onSearch={fetchBusArrivalsForStop} loading={loading} />

        {/* 노선 검색 바로가기 */}
        <div className="mb-6">
          <Link href="/route-search">
            <button className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
              🗺️ 출발지 → 도착지 노선 검색
            </button>
          </Link>
        </div>

        {/* 도착정보 표시 */}
        {selectedStop && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            {/* 정류소 정보 헤더 */}
            <div className="bg-blue-50 p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-red-600">{getCurrentStopName()}</h2>
                  <p className="text-sm text-gray-600">{selectedStop}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(selectedStop)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      favorites.includes(selectedStop)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {favorites.includes(selectedStop) ? '즐겨찾기' : '출발'}
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    도착
                  </button>
                </div>
              </div>
            </div>

            {/* 메뉴 탭 */}
            <div className="flex border-b bg-white">
              <button
                onClick={() => setSelectedView('arrival')}
                className={`flex-1 py-3 text-sm font-medium ${
                  selectedView === 'arrival'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500'
                }`}
              >
                도착시간순
              </button>
              <button
                onClick={() => setSelectedView('route')}
                className={`flex-1 py-3 text-sm font-medium ${
                  selectedView === 'route'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500'
                }`}
              >
                버스도착정보
              </button>
              <button
                onClick={() => setSelectedView('info')}
                className={`flex-1 py-3 text-sm font-medium ${
                  selectedView === 'info'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500'
                }`}
              >
                전광판
              </button>
              <button
                onClick={() => fetchArrivals(selectedStop)}
                className="p-3 text-blue-600 hover:bg-blue-50"
                disabled={loading}
              >
                🔄
              </button>
            </div>

            {/* 도착정보 내용 */}
            <div className="p-4">
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <span className="ml-3 text-gray-600">도착정보 조회 중...</span>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center text-red-800">
                    <span className="text-lg mr-2">⚠️</span>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              {!loading && !error && arrivals.length === 0 && selectedStop && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🚌</div>
                  <p>현재 운행 중인 버스가 없습니다.</p>
                  <p className="text-sm mt-2">운행시간: 05:00-24:00</p>
                </div>
              )}

              {arrivals.length > 0 && (
                <div className="space-y-3">
                  {arrivals.map((arrival, index) => (
                    <BusArrivalCard
                      key={`${arrival.routeNo}-${index}`}
                      arrival={{
                        ...arrival,
                        remainingSeatCnt: String(arrival.remainingSeatCnt),
                        isRealTime: arrival.isRealTime ?? true
                      }}
                      onClick={() => {
                        // 노선 상세 정보 보기 (추후 구현)
                        console.log('노선 상세:', arrival.routeNo);
                      }}
                      onScheduleClick={handleScheduleClick}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 하단 안내사항 */}
            <div className="bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-600">
                ※ 도착 예정 시간보다 30분 이상 늦어질 경우,{' '}
                <span className="font-medium">053)803-5590</span>으로 문의해 주시기 바랍니다.
              </p>
              {apiMode && (
                <div className="mt-2 flex items-center justify-center gap-2 text-xs">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    apiMode === 'official' ? 'bg-green-500' : 
                    apiMode === 'unofficial' ? 'bg-blue-500' : 'bg-orange-500'
                  }`}></span>
                  <span className="text-gray-500">
                    {apiMode === 'official' ? '실시간 API' : 
                     apiMode === 'unofficial' ? '커뮤니티 API' : '데모 데이터'}
                  </span>
                  {lastUpdateTime && (
                    <span className="text-gray-400">
                      • 마지막 업데이트: {lastUpdateTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 주변 정류장 목록 (간소화) */}
        {stopsWithDistance.length > 0 && !selectedStop && (
          <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">📍 주변 정류장</h3>
            <div className="grid gap-3">
              {stopsWithDistance.slice(0, 5).map((stop) => (
                <BusStopCard
                  key={stop.stopId}
                  stop={stop}
                  isFavorite={favorites.includes(stop.stopId)}
                  isSelected={selectedStop === stop.stopId}
                  onToggleFavorite={toggleFavorite}
                  onSelectStop={fetchBusArrivalsForStop}
                  showDistance={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* API 상태 대시보드 */}
        <ApiStatusDashboard
          apiMode={apiMode}
          loading={loading}
          error={error}
          lastUpdateTime={lastUpdateTime || undefined}
          totalStops={stopsWithDistance.length}
          totalArrivals={arrivals.length}
        />

        {/* 버스 알림 서비스 */}
        <BusNotificationServiceComponent
          arrivals={arrivals}
          selectedStopName={getCurrentStopName()}
          enabled={notificationEnabled}
          onToggle={toggleNotification}
        />
      </div>

      {/* 시간표 모달 */}
      {showSchedule && selectedRouteForSchedule && selectedStop && (
        <BusSchedule
          routeNo={selectedRouteForSchedule}
          stopId={selectedStop}
          onClose={handleScheduleClose}
        />
      )}
    </div>
  );
}