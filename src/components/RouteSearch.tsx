'use client';

import { useState, useEffect } from 'react';
import { useBusAPI } from '../hooks/useBusAPI';

interface BusRoute {
  routeId: string;
  routeNo: string;
  routeType: string;
  startStopName: string;
  endStopName: string;
  regionName?: string;
}

export default function RouteSearch() {
  const { fetchRoutes } = useBusAPI();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [allRoutes, setAllRoutes] = useState<BusRoute[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 검색 기록 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem('busRouteSearchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 모든 노선 데이터 로드
  const loadAllRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const routes = await fetchRoutes();
      setAllRoutes(routes);
      setFilteredRoutes(routes);
    } catch (err) {
      setError(err instanceof Error ? err.message : '노선 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 검색어가 변경될 때마다 필터링
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRoutes(allRoutes);
      return;
    }

    const filtered = allRoutes.filter(route => 
      route.routeNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.startStopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.endStopName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRoutes(filtered);
  }, [searchTerm, allRoutes]);

  // 검색 기록 저장
  const saveSearchHistory = (term: string) => {
    if (!term.trim()) return;
    
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('busRouteSearchHistory', JSON.stringify(newHistory));
  };

  // 검색 실행
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    saveSearchHistory(term);
  };

  // 검색 기록 삭제
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('busRouteSearchHistory');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🚌 버스 노선 검색</h2>
        <p className="text-gray-600">노선 번호나 정류장 이름으로 버스 노선을 검색하세요</p>
      </div>

      {/* 검색 입력 */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="노선 번호 또는 정류장 이름을 입력하세요 (예: 425, 달서구청)"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchTerm);
                }
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={loadAllRoutes}
            disabled={loading}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium transition-colors"
          >
            {loading ? '🔄 로딩...' : '🔍 전체 노선 로드'}
          </button>
        </div>
      </div>

      {/* 검색 기록 */}
      {searchHistory.length > 0 && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-700">최근 검색어</h3>
            <button
              onClick={clearSearchHistory}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              전체 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((term, index) => (
              <button
                key={index}
                onClick={() => handleSearch(term)}
                className="px-3 py-1 bg-white hover:bg-blue-50 text-gray-700 border border-gray-200 rounded-full text-sm transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          <h3 className="font-bold">⚠️ 오류 발생:</h3>
          <p>{error}</p>
          <button
            onClick={loadAllRoutes}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm"
          >
            🔄 다시 시도
          </button>
        </div>
      )}

      {/* 검색 결과 */}
      {filteredRoutes.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">
              🚌 검색 결과 {filteredRoutes.length}개
            </h3>
            {searchTerm && (
              <span className="text-sm text-gray-500">
                "{searchTerm}" 검색 결과
              </span>
            )}
          </div>

          <div className="grid gap-3">
            {filteredRoutes.map((route) => (
              <div
                key={route.routeId}
                className="p-4 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="inline-flex items-center justify-center w-16 h-8 bg-blue-100 text-blue-800 font-bold rounded text-sm">
                      {route.routeNo}
                    </span>
                    <div>
                      <div className="font-medium text-gray-800">
                        {route.startStopName} ↔ {route.endStopName}
                      </div>
                      <div className="text-sm text-gray-600">
                        노선 ID: {route.routeId}
                        {route.routeType && ` | 유형: ${route.routeType}`}
                        {route.regionName && ` | 지역: ${route.regionName}`}
                      </div>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors">
                    상세 정보
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 결과 없음 */}
      {filteredRoutes.length === 0 && searchTerm && !loading && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold mb-2">검색 결과가 없습니다</h3>
          <p>"{searchTerm}"와(과) 일치하는 노선을 찾을 수 없습니다.</p>
          <p className="text-sm mt-2">다른 검색어를 시도해보세요.</p>
        </div>
      )}

      {/* 초기 상태 */}
      {allRoutes.length === 0 && !loading && !error && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🚌</div>
          <h3 className="text-xl font-semibold mb-2">버스 노선 검색</h3>
          <p>전체 노선 로드 버튼을 클릭하여 검색을 시작하세요.</p>
          <p className="text-sm mt-2">대구시 모든 버스 노선 정보를 검색할 수 있습니다.</p>
        </div>
      )}
    </div>
  );
} 