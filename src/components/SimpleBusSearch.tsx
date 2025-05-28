'use client';

import React, { useState, useEffect } from 'react';
import { useBusAPI } from '../hooks/useBusAPI';
import { calculateDistance } from '../utils/locationUtils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BusStop {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface RecentSearch {
  query: string;
  timestamp: Date;
  type: 'stop' | 'route' | 'destination';
}

export default function SimpleBusSearch() {
  const { stops, loading, fetchArrivals } = useBusAPI(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyStops, setNearbyStops] = useState<BusStop[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const router = useRouter();

  // 컴포넌트 마운트 시 위치 정보 가져오기
  useEffect(() => {
    getCurrentLocation();
    loadRecentSearches();
  }, []);

  // 정류장 데이터가 로드되면 주변 정류장 계산
  useEffect(() => {
    if (stops.length > 0 && userLocation) {
      calculateNearbyStops();
    }
  }, [stops, userLocation]);

  // 현재 위치 가져오기
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('위치 정보를 가져올 수 없습니다:', error);
          // 대구 시청 좌표로 기본 설정
          setUserLocation({ lat: 35.8714, lng: 128.6014 });
        }
      );
    } else {
      // 대구 시청 좌표로 기본 설정
      setUserLocation({ lat: 35.8714, lng: 128.6014 });
    }
  };

  // 주변 정류장 계산
  const calculateNearbyStops = () => {
    if (!userLocation) return;

    const stopsWithDistance = stops.map((stop: any) => ({
      ...stop,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        stop.latitude,
        stop.longitude
      )
    }));

    // 거리순 정렬 후 상위 6개만 선택
    const sorted = stopsWithDistance
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 6);

    setNearbyStops(sorted);
  };

  // 최근 검색 기록 로드
  const loadRecentSearches = () => {
    const saved = localStorage.getItem('busRecentSearches');
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setRecentSearches(parsed);
      } catch (error) {
        console.error('최근 검색 기록 로드 실패:', error);
      }
    }
  };

  // 검색 기록 저장
  const saveSearchHistory = (query: string, type: RecentSearch['type']) => {
    const newSearch: RecentSearch = {
      query,
      timestamp: new Date(),
      type
    };

    const updated = [newSearch, ...recentSearches.filter(item => item.query !== query)]
      .slice(0, 5); // 최대 5개만 저장

    setRecentSearches(updated);
    localStorage.setItem('busRecentSearches', JSON.stringify(updated));
  };

  // 검색 실행
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    saveSearchHistory(searchQuery.trim(), 'stop');
    
    // 숫자만 입력된 경우 노선 도착정보로 이동
    const routePattern = /^[0-9가-힣]+$/;
    if (routePattern.test(searchQuery.trim())) {
      router.push(`/arrival/${encodeURIComponent(searchQuery.trim())}`);
    } else {
      // 일반 검색 결과 페이지로 이동
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 거리를 미터/킬로미터로 포맷
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  // 정류장 클릭 핸들러
  const handleStopClick = (stop: BusStop) => {
    saveSearchHistory(stop.stopName, 'stop');
    
    // 정류소 기준 도착정보 전광판 페이지로 이동
    router.push(`/stop/${stop.stopId}?stopName=${encodeURIComponent(stop.stopName)}`);
  };

  // 최근 검색 클릭 핸들러
  const handleRecentSearchClick = (search: RecentSearch) => {
    setSearchQuery(search.query);
    handleSearch();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 헤더 */}
      <header className="bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* 대구광역시 로고 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 text-white flex items-center justify-center rounded-lg font-bold text-lg">
              대구
            </div>
            <div>
              <div className="text-xl font-bold text-gray-800">대구광역시</div>
              <div className="text-base text-blue-600 font-semibold">버스정보시스템</div>
            </div>
          </div>
          <div className="ml-auto">
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
              <option>KOR</option>
              <option>ENG</option>
            </select>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="bg-blue-600 text-white text-center py-10">
        <h1 className="text-3xl font-bold mb-8">🚌 버스정보 통합검색</h1>
        
        {/* 검색창 */}
        <div className="max-w-md mx-auto px-4">
          <div className="flex bg-white rounded-xl overflow-hidden shadow-lg">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="노선번호(101, 급행1) 또는 정류장명"
              className="flex-1 px-5 py-4 text-gray-800 text-base focus:outline-none"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-8 py-4 hover:bg-blue-700 transition-colors"
            >
              <span className="text-xl">🔍</span>
            </button>
          </div>
          
          {/* 검색 안내 */}
          <div className="mt-3 text-sm text-blue-200">
            <p>💡 노선번호 입력 시 실시간 도착정보 전광판으로 이동합니다</p>
          </div>
          
          {/* 인기 노선 빠른 접근 */}
          <div className="mt-4">
            <p className="text-sm text-blue-200 mb-3">🔥 인기 노선 바로가기</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['101', '102', '급행1', '급행2', '달서1', '수성1'].map((route) => (
                <button
                  key={route}
                  onClick={() => router.push(`/arrival/${route}`)}
                  className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-400 transition-colors"
                >
                  {route}번
                </button>
              ))}
            </div>
          </div>
          
          {/* 경로 검색 링크 */}
          <div className="mt-6">
            <Link href="/route-search" className="inline-block bg-red-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-red-600 transition-colors shadow-lg">
              🗺️ 출발지→도착지 경로 검색
            </Link>
          </div>
        </div>
      </div>

      {/* 검색 결과 섹션 */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="bg-gray-100 border-b">
            <div className="grid grid-cols-2">
              <div className="p-4 text-center font-bold text-gray-700 border-r text-base">
                📝 최근 검색 내역
              </div>
              <div className="p-4 text-center font-bold text-blue-600 text-base">
                📍 내주변 정류소
              </div>
            </div>
          </div>

          {/* 테이블 내용 */}
          <div className="grid grid-cols-2 min-h-[400px]">
            {/* 최근 검색 내역 */}
            <div className="border-r">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-500 text-base">로딩 중...</p>
                </div>
              ) : recentSearches.length > 0 ? (
                <div className="divide-y">
                  {recentSearches.map((search, index) => (
                    <div
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="font-semibold text-gray-800 text-base">{search.query}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {search.timestamp.toLocaleDateString()} {search.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-5xl mb-4">🕒</div>
                  <p className="text-base font-medium">최근 검색 내역이 없습니다</p>
                  <p className="text-sm text-gray-400 mt-2">검색을 시작해보세요</p>
                </div>
              )}
            </div>

            {/* 내주변 정류소 */}
            <div>
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-500 text-base">주변 정류소 검색 중...</p>
                </div>
              ) : nearbyStops.length > 0 ? (
                <div className="divide-y">
                  {nearbyStops.map((stop, index) => (
                    <div
                      key={stop.stopId}
                      onClick={() => handleStopClick(stop)}
                      className="p-4 hover:bg-blue-50 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="font-semibold text-gray-800 text-base">{stop.stopName}</div>
                      <div className="text-blue-600 font-bold text-base">
                        {stop.distance !== undefined ? formatDistance(stop.distance) : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <div className="text-5xl mb-4">📍</div>
                  <p className="text-base font-medium">주변 정류소를 찾고 있습니다...</p>
                  <p className="text-sm text-gray-400 mt-2">위치 정보를 확인 중입니다</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 */}
      <footer className="bg-blue-600 text-white text-center py-8 mt-8">
        <div className="text-base mb-4">
          <p className="font-medium">daegu.go.kr | 대구광역 행정통합, 지역의 탄탄한 기반!</p>
        </div>
        
        {/* 앱 다운로드 */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-3 bg-blue-700 rounded-xl px-6 py-4">
            <span className="text-3xl">📱</span>
            <div className="text-left">
              <div className="text-sm font-semibold">앱(App)으로 사용하기</div>
              <div className="text-xs text-blue-200 mb-2">(출퇴근바로가기추가)</div>
              <div className="flex gap-2 mt-1">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-xs font-bold">삼성앱넷</span>
                <span className="bg-gray-700 px-3 py-1 rounded-lg text-xs font-bold">iOS</span>
                <span className="bg-green-600 px-3 py-1 rounded-lg text-xs font-bold">구글플레이</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 