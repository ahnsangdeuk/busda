import React from 'react';

interface ApiStatusDashboardProps {
  apiMode: 'official' | 'unofficial' | 'sample';
  loading: boolean;
  error: string | null;
  lastUpdateTime?: Date;
  totalStops: number;
  totalArrivals: number;
}

export default function ApiStatusDashboard({
  apiMode,
  loading,
  error,
  lastUpdateTime,
  totalStops,
  totalArrivals
}: ApiStatusDashboardProps) {
  
  const getStatusColor = () => {
    if (error) return 'text-red-600 bg-red-100';
    if (loading) return 'text-yellow-600 bg-yellow-100';
    if (apiMode === 'official') return 'text-green-600 bg-green-100';
    if (apiMode === 'unofficial') return 'text-blue-600 bg-blue-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getStatusIcon = () => {
    if (error) return '❌';
    if (loading) return '🔄';
    if (apiMode === 'official') return '✅';
    if (apiMode === 'unofficial') return '🔄';
    return '⚠️';
  };

  const getStatusText = () => {
    if (error) return '서비스 오류';
    if (loading) return '데이터 로딩 중';
    if (apiMode === 'official') return '대구시 공식 API';
    if (apiMode === 'unofficial') return '커뮤니티 API';
    return '샘플 데이터';
  };

  const getServiceQuality = () => {
    if (error) return 0;
    if (apiMode === 'official') return 100;
    if (apiMode === 'unofficial') return 80;
    return 50;
  };

  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">📊 서비스 상태</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* API 상태 */}
        <div className="text-center">
          <div className={`inline-flex items-center px-3 py-2 rounded-full ${getStatusColor()}`}>
            <span className="mr-2">{getStatusIcon()}</span>
            <span className="font-medium">{getStatusText()}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">API 연결 상태</div>
        </div>

        {/* 서비스 품질 */}
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {getServiceQuality()}%
          </div>
          <div className="text-xs text-gray-500">서비스 품질</div>
          <div className="mt-1 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                getServiceQuality() >= 80 ? 'bg-green-500' :
                getServiceQuality() >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${getServiceQuality()}%` }}
            />
          </div>
        </div>

        {/* 데이터 통계 */}
        <div className="text-center">
          <div className="text-sm text-gray-600 space-y-1">
            <div>📍 정류장: <span className="font-medium">{totalStops}개</span></div>
            <div>🚌 도착정보: <span className="font-medium">{totalArrivals}건</span></div>
            {lastUpdateTime && (
              <div className="text-xs text-gray-500">
                마지막 업데이트: {lastUpdateTime.toLocaleTimeString('ko-KR')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 상태별 추가 정보 */}
      {apiMode === 'official' && !error && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 text-sm">
            ✅ 대구시 공식 실시간 API에 연결되어 가장 정확한 정보를 제공합니다.
          </p>
        </div>
      )}

      {apiMode === 'unofficial' && !error && (
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-blue-700 text-sm">
            🔄 커뮤니티 API를 통해 서비스를 제공 중입니다. 곧 공식 API로 전환됩니다.
          </p>
        </div>
      )}

      {apiMode === 'sample' && !error && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
          <p className="text-orange-700 text-sm">
            ⚠️ 현재 샘플 데이터를 표시 중입니다. API 서비스 복구를 위해 노력하고 있습니다.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700 text-sm">
            ❌ 서비스 연결에 문제가 있습니다. 잠시 후 다시 시도해 주세요.
          </p>
        </div>
      )}
    </div>
  );
} 