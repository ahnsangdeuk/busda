import React from 'react';

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

interface BusArrivalCardProps {
  arrival: BusArrival;
  onClick?: () => void;
  onScheduleClick?: (routeNo: string) => void;
}

export default function BusArrivalCard({ arrival, onClick, onScheduleClick }: BusArrivalCardProps) {
  // 도착시간을 분 단위로 파싱
  const parseArrivalTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const arrivalMinutes = parseArrivalTime(arrival.arrivalTime);
  
  // 도착시간에 따른 색상 결정
  const getTimeColor = (minutes: number) => {
    if (minutes <= 3) return 'text-red-600 font-bold';
    if (minutes <= 10) return 'text-orange-500 font-semibold';
    return 'text-blue-600';
  };

  // 버스 타입에 따른 아이콘
  const getBusTypeIcon = (busType?: string) => {
    if (busType === '저상버스') return '♿';
    return '🚌';
  };

  // 노선 번호에 따른 배경색 (실제 대구버스 앱 스타일)
  const getRouteColor = (routeNo: string) => {
    if (routeNo.includes('급행')) return 'bg-red-500';
    if (routeNo.includes('달성')) return 'bg-green-500';
    if (routeNo.includes('순환')) return 'bg-purple-500';
    if (/^\d+$/.test(routeNo)) {
      const num = parseInt(routeNo);
      if (num >= 100 && num < 200) return 'bg-blue-500';
      if (num >= 200 && num < 300) return 'bg-green-500';
      if (num >= 300 && num < 400) return 'bg-orange-500';
      return 'bg-gray-500';
    }
    return 'bg-blue-500';
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {/* 노선번호와 버스타입 */}
        <div className="flex items-center gap-3">
          <div className={`${getRouteColor(arrival.routeNo)} text-white px-3 py-1 rounded-lg font-bold min-w-[60px] text-center`}>
            {arrival.routeNo}
          </div>
          <span className="text-lg">{getBusTypeIcon(arrival.busType)}</span>
        </div>

        {/* 도착시간 */}
        <div className="text-right">
          <div className={`text-2xl font-bold ${getTimeColor(arrivalMinutes)}`}>
            {arrivalMinutes}분
          </div>
          {arrival.isRealTime && (
            <div className="text-xs text-green-600 font-medium">실시간</div>
          )}
        </div>
      </div>

      {/* 현재위치와 남은정류장 */}
      <div className="mt-3 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span className="font-medium">{arrival.currentLocation}</span>
          <span className="text-blue-600 font-semibold">
            {arrival.remainingSeatCnt !== '정보없음' ? `${arrival.remainingSeatCnt}개소전` : ''}
          </span>
        </div>
      </div>

      {/* 버스번호와 시간표 버튼 */}
      <div className="mt-3 flex items-center justify-between">
        {arrival.busNumber && arrival.busNumber !== '정보없음' && (
          <div className="text-xs text-gray-500">
            버스번호: {arrival.busNumber}
          </div>
        )}
        
        {/* 시간표 보기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // 카드 클릭 이벤트 방지
            onScheduleClick?.(arrival.routeNo);
          }}
          className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
        >
          📅 시간표
        </button>
      </div>
    </div>
  );
} 