import React, { useState, useRef } from 'react';

interface BusStop {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
  district?: string;
  routes?: string[];
}

interface BusStopSearchProps {
  onSearch: (stopId: string) => Promise<void>;
  loading?: boolean;
}

export default function BusStopSearch({ onSearch, loading = false }: BusStopSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<BusStop[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // 컴포넌트 마운트 시 최근 검색어 로드
  React.useEffect(() => {
    const saved = localStorage.getItem('recentBusStopSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // 정류장명 검색 (실시간)
  const searchByName = async (query: string) => {
    if (!query.trim() || query.trim().length < 1) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setSearching(true);
      console.log(`🔍 정류장명 검색: "${query}"`);
      
      const response = await fetch(`/api/bus/stops/search/${encodeURIComponent(query.trim())}`);
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setSearchResults(result.data);
        setShowResults(true);
        console.log(`📋 검색 결과: ${result.data.length}개 정류장`);
      } else {
        setSearchResults([]);
        setShowResults(false);
        console.log('검색 결과 없음');
      }
    } catch (error) {
      console.error('정류장명 검색 오류:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setSearching(false);
    }
  };

  // 검색어 입력 처리 (실시간 검색)
  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
    
    // 정류장 ID 형식(숫자만)이면 실시간 검색 안함
    if (/^\d+$/.test(value.trim())) {
      setShowResults(false);
      return;
    }
    
    // 2자 이상일 때 실시간 검색
    if (value.trim().length >= 2) {
      const debounceTimer = setTimeout(() => {
        searchByName(value);
      }, 300); // 300ms 디바운스
      
      return () => clearTimeout(debounceTimer);
    } else {
      setShowResults(false);
    }
  };

  // 검색 실행 (직접 검색 버튼 또는 엔터)
  const handleDirectSearch = async () => {
    if (!searchTerm.trim()) return;

    const trimmedTerm = searchTerm.trim();
    
    // 숫자만 있으면 정류장 ID로 간주하고 바로 검색
    if (/^\d+$/.test(trimmedTerm)) {
      await executeSearch(trimmedTerm);
      return;
    }

    // 정류장명이면 첫 번째 검색 결과 사용
    if (searchResults.length > 0) {
      await executeSearch(searchResults[0].stopId);
    } else {
      // 검색 결과가 없으면 새로 검색
      await searchByName(trimmedTerm);
      // 잠시 후 첫 번째 결과로 검색
      setTimeout(async () => {
        if (searchResults.length > 0) {
          await executeSearch(searchResults[0].stopId);
        }
      }, 500);
    }
  };

  // 실제 버스 도착정보 검색 실행
  const executeSearch = async (stopId: string) => {
    // 최근 검색어에 추가
    const newRecentSearches = [
      stopId,
      ...recentSearches.filter(term => term !== stopId)
    ].slice(0, 5);

    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentBusStopSearches', JSON.stringify(newRecentSearches));

    // 검색 결과 숨기기
    setShowResults(false);
    setSearchTerm('');

    // 실제 검색 실행
    await onSearch(stopId);
  };

  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDirectSearch();
    } else if (e.key === 'Escape') {
      setShowResults(false);
      setSearchTerm('');
    }
  };

  // 검색 결과 클릭
  const handleResultClick = (stop: BusStop) => {
    setSearchTerm(stop.stopName);
    executeSearch(stop.stopId);
  };

  // 최근 검색어 클릭
  const handleRecentSearch = (term: string) => {
    setSearchTerm(term);
    executeSearch(term);
  };

  // 최근 검색어 삭제
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentBusStopSearches');
  };

  // 대구 주요 정류장 (실제 정류장 ID 포함)
  const popularStops = [
    { id: "7041014900", name: "달서구청건너" },
    { id: "7041014800", name: "달서구청앞" },
    { id: "7031008000", name: "서구청건너" },
    { id: "7031007900", name: "서구청앞" },
    { id: "7011001000", name: "동대구역(KTX)" },
    { id: "7011001100", name: "동대구역건너" },
    { id: "7021005000", name: "대구역앞" },
    { id: "7021005100", name: "대구역건너" },
    { id: "7071010000", name: "계명대학교" },
    { id: "7071010100", name: "계명대입구" },
    { id: "7081015000", name: "영남대학교" },
    { id: "7081015100", name: "영남대병원" }
  ];

  return (
    <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">🔍 정류장 검색</h3>
      
      {/* 검색 입력 */}
      <div className="relative">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchTermChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="정류장명 (예: 대구역, 달서구청) 또는 정류장 ID를 입력하세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              disabled={loading}
            />
            {(searching || searchTerm) && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                {searching && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                )}
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setShowResults(false);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleDirectSearch}
            disabled={loading || !searchTerm.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors min-w-[100px]"
          >
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>

        {/* 검색 결과 드롭다운 */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs text-gray-500 mb-2">
                {searchResults.length}개 정류장 발견
              </div>
              {searchResults.map((stop) => (
                <button
                  key={stop.stopId}
                  onClick={() => handleResultClick(stop)}
                  className="w-full text-left px-3 py-2 hover:bg-blue-50 rounded border-l-2 border-transparent hover:border-blue-500 transition-all"
                >
                  <div className="font-medium text-gray-800">{stop.stopName}</div>
                  <div className="text-xs text-gray-500">
                    ID: {stop.stopId}
                    {stop.district && ` • ${stop.district}`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 검색 도움말 */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-1">💡 검색 팁</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>정류장명:</strong> "대구역", "달서구청", "동대구역" 등 (2자 이상)</li>
          <li>• <strong>정류장 ID:</strong> 10자리 숫자 (예: 7001001400)</li>
          <li>• 정류장명은 부분 검색이 가능합니다 (실시간 검색 결과 표시)</li>
        </ul>
      </div>

      {/* 최근 검색어 */}
      {recentSearches.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-700">최근 검색어</h4>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              전체 삭제
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((term, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearch(term)}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 인기 정류장 바로가기 */}
      <div className="mt-4">
        <h4 className="font-medium text-gray-700 mb-2">🔥 인기 정류장</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {popularStops.map((stop) => (
            <button
              key={stop.id}
              onClick={() => handleRecentSearch(stop.id)}
              className="p-2 text-left bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
            >
              <div className="font-medium text-sm text-gray-800">{stop.name}</div>
              <div className="text-xs text-gray-500">{stop.id}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 