import React from 'react';

interface BusStop {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface BusStopCardProps {
  stop: BusStop;
  isFavorite: boolean;
  isSelected: boolean;
  onToggleFavorite: (stopId: string) => void;
  onSelectStop: (stopId: string) => void;
  showDistance?: boolean;
}

export default function BusStopCard({ 
  stop, 
  isFavorite, 
  isSelected,
  onToggleFavorite, 
  onSelectStop,
  showDistance = true 
}: BusStopCardProps) {
  
  // 거리 표시 형식
  const formatDistance = (distance: number) => {
    if (distance > 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    } else {
      return `${distance.toFixed(0)}m`;
    }
  };

  // 거리에 따른 색상
  const getDistanceColor = (distance: number) => {
    if (distance <= 300) return 'text-green-600';
    if (distance <= 800) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={`p-4 border rounded-lg transition-all hover:shadow-md cursor-pointer ${
      isSelected 
        ? 'border-blue-500 bg-blue-50 shadow-md' 
        : 'border-gray-200 bg-white hover:bg-gray-50'
    }`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0" onClick={() => onSelectStop(stop.stopId)}>
          {/* 정류장 이름 */}
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`font-semibold text-lg truncate ${
              isSelected ? 'text-blue-800' : 'text-gray-800'
            }`}>
              {stop.stopName}
            </h3>
            {isSelected && (
              <span className="text-blue-500 text-sm">● 선택됨</span>
            )}
          </div>

          {/* 거리 정보 */}
          {showDistance && stop.distance !== undefined && (
            <div className="flex items-center space-x-1 mb-2">
              <span className="text-sm">📍</span>
              <span className={`text-sm font-medium ${getDistanceColor(stop.distance)}`}>
                {formatDistance(stop.distance)}
              </span>
              <span className="text-xs text-gray-500">
                {stop.distance <= 300 ? '도보 3분' : 
                 stop.distance <= 800 ? '도보 8분' : '도보 10분+'}
              </span>
            </div>
          )}

          {/* 정류장 정보 */}
          <div className="space-y-1 text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <span>🆔</span>
              <span>정류장 ID: {stop.stopId}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📍</span>
              <span>위치: {stop.latitude.toFixed(5)}, {stop.longitude.toFixed(5)}</span>
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col space-y-2 ml-4">
          {/* 즐겨찾기 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(stop.stopId);
            }}
            className={`text-2xl transition-all ${
              isFavorite 
                ? 'text-yellow-500 hover:text-yellow-600 transform hover:scale-110' 
                : 'text-gray-300 hover:text-yellow-400'
            }`}
            title={isFavorite ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}
          >
            ⭐
          </button>

          {/* 도착정보 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectStop(stop.stopId);
            }}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              isSelected
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-700 hover:bg-blue-500 hover:text-white'
            }`}
          >
            {isSelected ? '새로고침' : '도착정보'}
          </button>
        </div>
      </div>

      {/* 선택된 정류장에 대한 추가 정보 */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center space-x-2 text-blue-700 text-sm">
            <span>🚌</span>
            <span className="font-medium">이 정류장의 실시간 버스 도착 정보를 확인하세요</span>
          </div>
        </div>
      )}
    </div>
  );
} 