'use client';

import React, { useState, useEffect } from 'react';
import { useBusAPI } from '../hooks/useBusAPI';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
  prevBsGap?: string;
}

interface BusStop {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
}

interface SearchResult {
  success: boolean;
  data: BusStop[];
  searchQuery: string;
  resultAnalysis?: {
    totalFound: number;
    exactMatches: number;
    partialMatches: number;
    chosungMatches: number;
    relatedMatches: number;
  };
  relatedKeywords?: string[];
  totalResults: number;
  message: string;
}

export default function BusStopDetailPage() {
  const { arrivals, loading, error, fetchArrivals } = useBusAPI(0);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [stopName, setStopName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // 검색 결과 상태
  const [searchResults, setSearchResults] = useState<BusStop[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [resultAnalysis, setResultAnalysis] = useState<SearchResult['resultAnalysis'] | null>(null);
  const [relatedKeywords, setRelatedKeywords] = useState<string[]>([]);

  // URL 파라미터에서 정보 가져오기
  useEffect(() => {
    const stopId = searchParams.get('stopId');
    const stopNameParam = searchParams.get('stopName');
    const queryParam = searchParams.get('query');

    if (stopId && stopNameParam) {
      // 특정 정류장 페이지
      setSelectedStop(stopId);
      setStopName(decodeURIComponent(stopNameParam));
      setSearchQuery(decodeURIComponent(stopNameParam));
      fetchArrivals(stopId);
      setLastUpdateTime(new Date());
      setSearchResults([]); // 검색 결과 초기화
    } else if (queryParam) {
      // 검색 결과 페이지
      const decodedQuery = decodeURIComponent(queryParam);
      setSearchQuery(decodedQuery);
      setSelectedStop(null);
      setStopName('');
      performSearch(decodedQuery);
    }
  }, [searchParams, fetchArrivals]);

  // 검색 실행
  const performSearch = async (query: string) => {
    if (!query.trim()) return;

    setSearchLoading(true);
    setSearchError(null);

    try {
      console.log(`🔍 검색 시작: "${query}"`);
      
      const response = await fetch(`/api/bus/stops/search/${encodeURIComponent(query)}`);
      const result: SearchResult = await response.json();

      if (result.success) {
        setSearchResults(result.data);
        setResultAnalysis(result.resultAnalysis || null);
        setRelatedKeywords(result.relatedKeywords || []);
        console.log(`✅ 검색 완료: ${result.data.length}개 결과`);
      } else {
        setSearchError(result.message || '검색에 실패했습니다.');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('❌ 검색 오류:', error);
      setSearchError('검색 중 오류가 발생했습니다.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // 즐겨찾기 상태 확인
  useEffect(() => {
    if (selectedStop) {
      const favorites = JSON.parse(localStorage.getItem('busFavorites') || '[]');
      setIsFavorite(favorites.includes(selectedStop));
    }
  }, [selectedStop]);

  // 즐겨찾기 토글
  const toggleFavorite = () => {
    if (!selectedStop) return;
    
    const favorites = JSON.parse(localStorage.getItem('busFavorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== selectedStop);
    } else {
      newFavorites = [...favorites, selectedStop];
    }
    
    localStorage.setItem('busFavorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  // 새로고침
  const handleRefresh = () => {
    if (selectedStop) {
      fetchArrivals(selectedStop);
      setLastUpdateTime(new Date());
    } else if (searchQuery) {
      performSearch(searchQuery);
    }
  };

  // 검색 실행
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // 정류장 선택
  const handleStopSelect = (stop: BusStop) => {
    router.push(`/search?stopId=${stop.stopId}&stopName=${encodeURIComponent(stop.stopName)}`);
  };

  // 도착시간 파싱 및 표시
  const formatArrivalTime = (timeStr: string): string => {
    if (timeStr.includes('기점출발예정')) {
      return '기점출발예정';
    }
    
    const match = timeStr.match(/(\d+)/);
    if (match) {
      const minutes = parseInt(match[1]);
      if (minutes === 0) return '곧 도착';
      return `${minutes}분`;
    }
    
    return timeStr;
  };

  // 노선번호에 따른 색상
  const getRouteColor = (routeNo: string) => {
    if (routeNo.includes('달성')) return 'bg-green-500';
    if (routeNo.includes('급행')) return 'bg-red-500';
    if (/^\d+$/.test(routeNo)) {
      const num = parseInt(routeNo);
      if (num >= 600 && num < 700) return 'bg-blue-600';
      return 'bg-blue-500';
    }
    return 'bg-blue-500';
  };

  // 검색 결과 분석 표시
  const renderSearchAnalysis = () => {
    if (!resultAnalysis) return null;

    const { exactMatches, partialMatches, chosungMatches, relatedMatches } = resultAnalysis;
    const total = exactMatches + partialMatches + chosungMatches + relatedMatches;

    return (
      <div className="bg-blue-50 p-3 rounded-lg mb-4">
        <div className="text-sm text-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">검색 결과 분석</span>
            <span className="text-blue-600">총 {total}개 발견</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {exactMatches > 0 && (
              <div className="flex justify-between">
                <span>정확 일치:</span>
                <span className="font-medium">{exactMatches}개</span>
              </div>
            )}
            {partialMatches > 0 && (
              <div className="flex justify-between">
                <span>부분 일치:</span>
                <span className="font-medium">{partialMatches}개</span>
              </div>
            )}
            {chosungMatches > 0 && (
              <div className="flex justify-between">
                <span>초성 일치:</span>
                <span className="font-medium">{chosungMatches}개</span>
              </div>
            )}
            {relatedMatches > 0 && (
              <div className="flex justify-between">
                <span>연관 검색:</span>
                <span className="font-medium">{relatedMatches}개</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 연관 키워드 표시
  const renderRelatedKeywords = () => {
    if (!relatedKeywords || relatedKeywords.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">연관 검색어:</div>
        <div className="flex flex-wrap gap-2">
          {relatedKeywords.map((keyword, index) => (
            <button
              key={index}
              onClick={() => {
                setSearchQuery(keyword);
                router.push(`/search?query=${encodeURIComponent(keyword)}`);
              }}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors"
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-blue-600">
      {/* 상단 헤더 */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="text-white hover:bg-blue-500 p-2 rounded-full">
                🏠
              </button>
            </Link>
            <h1 className="text-lg font-bold">대구버스 통합검색</h1>
          </div>
          <button className="text-white hover:bg-blue-500 p-2 rounded-full">
            🎯
          </button>
        </div>

        {/* 검색바 */}
        <div className="flex gap-2">
          <div className="flex items-center bg-white rounded-lg flex-1 overflow-hidden">
            <div className="bg-blue-500 text-white p-3 flex items-center">
              🚌
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-3 py-3 text-gray-800 focus:outline-none"
              placeholder="정류소, 노선 검색 (초성 검색 가능)"
            />
          </div>
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-400"
          >
            🔍
          </button>
          <button 
            onClick={handleRefresh}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-400"
            disabled={searchLoading || loading}
          >
            {searchLoading || loading ? '⟳' : '🔄'}
          </button>
        </div>
      </div>

      {/* 검색 결과 목록 */}
      {!selectedStop && searchQuery && (
        <div className="bg-white mx-4 -mt-2 rounded-t-lg shadow-lg">
          <div className="text-center py-2 bg-blue-100 rounded-t-lg">
            <span className="text-blue-600 font-medium">
              "{searchQuery}" 검색 결과
            </span>
          </div>
          
          <div className="p-4">
            {searchLoading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600">검색 중...</p>
              </div>
            )}

            {searchError && (
              <div className="text-center py-8 text-red-600">
                <p>⚠️ {searchError}</p>
              </div>
            )}

            {!searchLoading && !searchError && searchResults.length === 0 && searchQuery && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">🔍</div>
                <p>"{searchQuery}"와 일치하는 정류장을 찾을 수 없습니다</p>
                <p className="text-sm mt-2">다른 검색어를 시도해보세요</p>
              </div>
            )}

            {searchResults.length > 0 && (
              <>
                {renderSearchAnalysis()}
                {renderRelatedKeywords()}
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searchResults.map((stop, index) => (
                    <div
                      key={stop.stopId}
                      onClick={() => handleStopSelect(stop)}
                      className="border rounded-lg p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">{stop.stopName}</h3>
                          <p className="text-sm text-gray-500">{stop.stopId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {index + 1}
                          </span>
                          <span className="text-gray-400">📍</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 정류소 상세 정보 */}
      {selectedStop && (
        <>
          <div className="bg-white mx-4 -mt-2 rounded-t-lg shadow-lg">
            <div className="text-center py-2 bg-blue-100 rounded-t-lg">
              <span className="text-blue-600 font-medium">정류소</span>
            </div>
            
            {/* 정류소 이름과 번호 */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-red-600">{stopName}</h2>
                  <p className="text-gray-600">{selectedStop}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full ${
                      isFavorite ? 'text-yellow-500' : 'text-gray-400'
                    }`}
                  >
                    ⭐
                  </button>
                  <button className="p-2 rounded-full text-gray-400">
                    📍
                  </button>
                </div>
              </div>
              
              {/* 출발/도착 버튼 */}
              <div className="flex gap-2 mt-3">
                <button className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                  출발
                </button>
                <button className="bg-red-500 text-white px-4 py-1 rounded-full text-sm">
                  도착
                </button>
              </div>
            </div>

            {/* 탭 메뉴 */}
            <div className="flex border-b">
              <div className="flex-1 text-center py-3 bg-blue-50 text-blue-600 font-medium border-b-2 border-blue-600">
                도착시간순
              </div>
              <div className="flex-1 text-center py-3 text-gray-500 font-medium">
                버스도착정보
              </div>
              <div className="flex-1 text-center py-3 text-gray-500 font-medium">
                전광판
              </div>
              <button
                onClick={handleRefresh}
                className="px-4 py-3 text-blue-600 hover:bg-blue-50"
                disabled={loading}
              >
                {loading ? '⟳' : '🔄'}
              </button>
            </div>

            {/* 버스 도착 정보 */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">도착정보 조회 중...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-red-600">
                  <p>⚠️ {error}</p>
                </div>
              )}

              {!loading && !error && arrivals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🚌</div>
                  <p>현재 운행 중인 버스가 없습니다</p>
                </div>
              )}

              {arrivals.length > 0 && (
                <div className="space-y-4">
                  {arrivals.map((arrival, index) => (
                    <div key={`${arrival.routeNo}-${index}`} className="border-b pb-3 last:border-b-0">
                      {/* 노선 정보 */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`${getRouteColor(arrival.routeNo)} text-white px-3 py-1 rounded font-bold text-lg`}>
                          {arrival.routeNo}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="text-gray-800 font-medium">
                              {formatArrivalTime(arrival.arrivalTime)}
                            </span>
                            <span className="text-gray-600">
                              {arrival.currentLocation}
                            </span>
                          </div>
                          
                          {/* 상세 정보 */}
                          {arrival.remainingSeatCnt !== '정보없음' && (
                            <div className="text-sm text-gray-600 mt-1">
                              {arrival.remainingSeatCnt}개소전{' '}
                              <span className="font-semibold text-blue-600">
                                {formatArrivalTime(arrival.arrivalTime)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-gray-400">
                          📍
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 하단 여백 */}
          <div className="h-20"></div>
        </>
      )}

      {/* 초기 상태 */}
      {!selectedStop && !searchQuery && (
        <div className="text-center text-white p-8">
          <div className="text-4xl mb-4">🔍</div>
          <p>정류장을 검색해주세요</p>
          <p className="text-sm mt-2 opacity-80">초성 검색도 가능합니다 (예: ㄱㄱㅅㄷ)</p>
        </div>
      )}
    </div>
  );
} 