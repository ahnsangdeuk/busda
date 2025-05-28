'use client';

import React, { useState, useEffect } from 'react';

interface BusArrival {
  routeId: string;
  routeNo: string;
  stationId: string;
  stationName: string;
  predictTime1: number;
  predictTime2: number;
  remainSeatCnt1: number;
  remainSeatCnt2: number;
  lowplate1: string;
  lowplate2: string;
  plateNo1: string;
  plateNo2: string;
  busStatus1: string;
  busStatus2: string;
  congestion1: string;
  congestion2: string;
  vehicleType1: string;
  vehicleType2: string;
  routeType: string;
  direction: string;
  lastBusFlag1: boolean;
  lastBusFlag2: boolean;
}

interface Props {
  routeNo: string;
}

type TabType = 'schedule' | 'businfo' | 'display';

export default function BusArrivalBoard({ routeNo }: Props) {
  const [arrivals, setArrivals] = useState<BusArrival[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabType>('schedule');

  // 데이터 가져오기
  const fetchArrivalData = async () => {
    if (!routeNo) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bus?routeNo=${encodeURIComponent(routeNo)}`);
      const result = await response.json();

      if (result.success) {
        setArrivals(result.data);
        setLastUpdate(new Date());
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('도착정보를 가져올 수 없습니다.');
      console.error('도착정보 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 및 30초마다 자동 새로고침
  useEffect(() => {
    fetchArrivalData();
    const interval = setInterval(fetchArrivalData, 30000);
    return () => clearInterval(interval);
  }, [routeNo]);

  // 노선 타입별 색상 (대구 시스템 스타일)
  const getRouteTypeColor = (routeType: string) => {
    switch (routeType) {
      case '급행': return 'bg-red-600 text-white';
      case '지선': return 'bg-green-600 text-white';
      case '간선': return 'bg-blue-600 text-white';
      case '달성': return 'bg-green-500 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  // 혼잡도 색상
  const getCongestionColor = (congestion: string) => {
    switch (congestion) {
      case '여유': return 'text-green-600';
      case '보통': return 'text-blue-600';
      case '혼잡': return 'text-orange-600';
      case '매우혼잡': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // 도착시간 포맷
  const formatArrivalTime = (minutes: number): string => {
    if (minutes === 0) return '곧 도착';
    if (minutes === 1) return '1분 후';
    return `${minutes}분 후`;
  };

  // 현재 시간 표시
  const formatCurrentTime = (date: Date): string => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 모든 버스를 도착시간 순으로 정렬
  const getAllBusesSchedule = () => {
    const allBuses: Array<{
      stationName: string;
      stationId: string;
      routeNo: string;
      routeType: string;
      predictTime: number;
      plateNo: string;
      congestion: string;
      busStatus: string;
      vehicleType: string;
      direction: string;
      lastBusFlag: boolean;
      remainSeatCnt: number;
    }> = [];

    arrivals.forEach(arrival => {
      if (arrival.predictTime1 > 0) {
        allBuses.push({
          stationName: arrival.stationName,
          stationId: arrival.stationId,
          routeNo: arrival.routeNo,
          routeType: arrival.routeType,
          predictTime: arrival.predictTime1,
          plateNo: arrival.plateNo1,
          congestion: arrival.congestion1,
          busStatus: arrival.busStatus1,
          vehicleType: arrival.vehicleType1,
          direction: arrival.direction,
          lastBusFlag: arrival.lastBusFlag1,
          remainSeatCnt: arrival.remainSeatCnt1
        });
      }
      if (arrival.predictTime2 > 0) {
        allBuses.push({
          stationName: arrival.stationName,
          stationId: arrival.stationId,
          routeNo: arrival.routeNo,
          routeType: arrival.routeType,
          predictTime: arrival.predictTime2,
          plateNo: arrival.plateNo2,
          congestion: arrival.congestion2,
          busStatus: arrival.busStatus2,
          vehicleType: arrival.vehicleType2,
          direction: arrival.direction,
          lastBusFlag: arrival.lastBusFlag2,
          remainSeatCnt: arrival.remainSeatCnt2
        });
      }
    });

    return allBuses.sort((a, b) => a.predictTime - b.predictTime);
  };

  // 탭별 컨텐츠 렌더링
  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-blue-600 text-xl font-bold">정보를 불러오는 중...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">❌</div>
            <div className="text-red-600 text-xl font-bold">{error}</div>
            <button
              onClick={fetchArrivalData}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    if (arrivals.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-4xl mb-4">🚫</div>
            <div className="text-gray-600 text-xl font-bold">운행 정보가 없습니다</div>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'schedule':
        return renderScheduleTab();
      case 'businfo':
        return renderBusInfoTab();
      case 'display':
        return renderDisplayTab();
      default:
        return renderScheduleTab();
    }
  };

  // 도착시간순 탭
  const renderScheduleTab = () => {
    const sortedBuses = getAllBusesSchedule();
    
    return (
      <div className="p-4">
        <div className="grid gap-3">
          {sortedBuses.map((bus, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-bold text-green-600">
                    {formatArrivalTime(bus.predictTime)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-sm font-bold ${getRouteTypeColor(bus.routeType)}`}>
                        {bus.routeNo}
                      </span>
                      {bus.lastBusFlag && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">막차</span>
                      )}
                      {bus.vehicleType === '저상' && (
                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">저상</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{bus.stationName}</div>
                      <div>차량: {bus.plateNo} | {bus.direction}</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${getCongestionColor(bus.congestion)}`}>
                    {bus.congestion}
                  </div>
                  <div className="text-sm text-gray-500">
                    {bus.remainSeatCnt}석
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 버스도착정보 탭
  const renderBusInfoTab = () => {
    return (
      <div className="p-4">
        <div className="grid gap-4">
          {arrivals.map((arrival) => (
            <div key={arrival.stationId} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-3">
                <h3 className="font-bold text-lg">{arrival.stationName}</h3>
                <p className="text-sm text-blue-200">{arrival.stationId} | {arrival.direction}</p>
              </div>
              
              <div className="p-4 space-y-4">
                {arrival.predictTime1 > 0 && (
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">도착시간</div>
                        <div className="text-xl font-bold text-green-600">
                          {formatArrivalTime(arrival.predictTime1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">차량번호</div>
                        <div className="font-mono">{arrival.plateNo1}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">혼잡도</div>
                        <div className={`font-semibold ${getCongestionColor(arrival.congestion1)}`}>
                          {arrival.congestion1}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">잔여석</div>
                        <div>{arrival.remainSeatCnt1}석</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">운행상태</div>
                        <div>{arrival.busStatus1}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">차량타입</div>
                        <div className="flex gap-1">
                          {arrival.vehicleType1}
                          {arrival.lastBusFlag1 && <span className="text-red-600 text-sm">막차</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {arrival.predictTime2 > 0 && (
                  <div className="border-l-4 border-yellow-500 pl-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">도착시간</div>
                        <div className="text-xl font-bold text-yellow-600">
                          {formatArrivalTime(arrival.predictTime2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">차량번호</div>
                        <div className="font-mono">{arrival.plateNo2}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">혼잡도</div>
                        <div className={`font-semibold ${getCongestionColor(arrival.congestion2)}`}>
                          {arrival.congestion2}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">잔여석</div>
                        <div>{arrival.remainSeatCnt2}석</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">운행상태</div>
                        <div>{arrival.busStatus2}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">차량타입</div>
                        <div className="flex gap-1">
                          {arrival.vehicleType2}
                          {arrival.lastBusFlag2 && <span className="text-red-600 text-sm">막차</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 전광판 탭
  const renderDisplayTab = () => {
    return (
      <div className="bg-black text-green-400 p-6 font-mono">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold mb-2">🚌 실시간 버스 도착정보</div>
          <div className="text-lg">{routeNo}번 버스</div>
          <div className="text-sm text-green-300">
            {formatCurrentTime(lastUpdate)} 업데이트
          </div>
        </div>

        <div className="space-y-4">
          {arrivals.map((arrival, index) => (
            <div key={arrival.stationId} className="border border-green-400 p-4">
              <div className="text-center mb-3">
                <div className="text-xl font-bold text-yellow-400">{arrival.stationName}</div>
                <div className="text-sm text-green-300">{arrival.stationId}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {arrival.predictTime1 > 0 && (
                  <div className="text-center border-r border-green-400 pr-4">
                    <div className="text-3xl font-bold mb-2">
                      {formatArrivalTime(arrival.predictTime1)}
                    </div>
                    <div className="text-sm space-y-1">
                      <div>차량: {arrival.plateNo1}</div>
                      <div className="text-yellow-400">{arrival.congestion1}</div>
                      {arrival.lastBusFlag1 && (
                        <div className="text-red-400">막차</div>
                      )}
                    </div>
                  </div>
                )}

                {arrival.predictTime2 > 0 && (
                  <div className="text-center pl-4">
                    <div className="text-2xl font-bold mb-2 text-yellow-400">
                      {formatArrivalTime(arrival.predictTime2)}
                    </div>
                    <div className="text-sm space-y-1">
                      <div>차량: {arrival.plateNo2}</div>
                      <div className="text-yellow-400">{arrival.congestion2}</div>
                      {arrival.lastBusFlag2 && (
                        <div className="text-red-400">막차</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6 text-green-300 text-sm">
          <div className="animate-pulse">● 30초마다 자동 업데이트 ●</div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* 대구시 스타일 헤더 */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold">🚌 대구버스 통합검색</div>
            <div className="text-lg font-semibold">{routeNo}번</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">실시간</div>
            <div className="text-lg font-bold">{formatCurrentTime(lastUpdate)}</div>
          </div>
        </div>
      </div>

      {/* 정류소 정보 헤더 */}
      <div className="bg-gray-200 p-3 border-b">
        <div className="text-lg font-bold text-gray-800">정류소</div>
      </div>

      {/* 탭 헤더 - 클릭 가능 */}
      <div className="bg-gray-100 grid grid-cols-3 border-b">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`p-4 text-center font-bold border-r transition-colors ${
            activeTab === 'schedule'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          도착시간순
        </button>
        <button
          onClick={() => setActiveTab('businfo')}
          className={`p-4 text-center font-bold border-r transition-colors ${
            activeTab === 'businfo'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          버스도착정보
        </button>
        <button
          onClick={() => setActiveTab('display')}
          className={`p-4 text-center font-bold transition-colors ${
            activeTab === 'display'
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          전광판
        </button>
      </div>

      {/* 탭별 컨텐츠 */}
      <div className="bg-white border border-gray-300 min-h-[500px]">
        {renderTabContent()}
      </div>

      {/* 하단 컨트롤 */}
      <div className="bg-blue-600 text-white p-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span>🔄 30초마다 자동 업데이트</span>
            <button
              onClick={fetchArrivalData}
              className="bg-white text-blue-600 px-4 py-2 rounded font-bold hover:bg-gray-100"
            >
              수동 새로고침
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select className="bg-white text-blue-600 px-3 py-1 rounded text-sm">
              <option>KOR</option>
              <option>ENG</option>
            </select>
            <div className="text-xs">
              daegu.go.kr
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 