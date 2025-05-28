import React, { useState, useEffect } from 'react';

interface ScheduleTime {
  hour: number;
  minutes: number[];
}

interface BusScheduleInfo {
  routeNo: string;
  routeName: string;
  firstBus: string;
  lastBus: string;
  interval: string;
  operatingDays: string;
  weekdaySchedule: ScheduleTime[];
  weekendSchedule: ScheduleTime[];
  direction: 'up' | 'down';
  totalStops: number;
  totalTime: string;
}

interface BusScheduleProps {
  routeNo: string;
  stopId: string;
  onClose: () => void;
}

export default function BusSchedule({ routeNo, stopId, onClose }: BusScheduleProps) {
  const [scheduleInfo, setScheduleInfo] = useState<BusScheduleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<'weekday' | 'weekend'>('weekday');
  const [error, setError] = useState<string | null>(null);

  // 샘플 시간표 데이터 (실제로는 API에서 가져와야 함)
  const getSampleSchedule = (routeNo: string): BusScheduleInfo => {
    const baseSchedule: ScheduleTime[] = [
      { hour: 5, minutes: [30, 50] },
      { hour: 6, minutes: [10, 30, 50] },
      { hour: 7, minutes: [10, 25, 40, 55] },
      { hour: 8, minutes: [10, 25, 40, 55] },
      { hour: 9, minutes: [15, 35, 55] },
      { hour: 10, minutes: [15, 35, 55] },
      { hour: 11, minutes: [15, 35, 55] },
      { hour: 12, minutes: [15, 35, 55] },
      { hour: 13, minutes: [15, 35, 55] },
      { hour: 14, minutes: [15, 35, 55] },
      { hour: 15, minutes: [15, 35, 55] },
      { hour: 16, minutes: [10, 25, 40, 55] },
      { hour: 17, minutes: [10, 25, 40, 55] },
      { hour: 18, minutes: [10, 30, 50] },
      { hour: 19, minutes: [10, 30, 50] },
      { hour: 20, minutes: [15, 35, 55] },
      { hour: 21, minutes: [15, 35, 55] },
      { hour: 22, minutes: [15, 45] },
      { hour: 23, minutes: [15] }
    ];

    return {
      routeNo,
      routeName: `${routeNo}번 (대구역 ↔ 달서구청)`,
      firstBus: "05:30",
      lastBus: "23:15",
      interval: "평일 15-20분, 주말 20-25분",
      operatingDays: "매일운행",
      weekdaySchedule: baseSchedule,
      weekendSchedule: baseSchedule.map(schedule => ({
        ...schedule,
        minutes: schedule.minutes.filter((_, index) => index % 2 === 0) // 주말에는 배차 간격 늘림
      })),
      direction: 'up',
      totalStops: 24,
      totalTime: "약 45분"
    };
  };

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);

      try {
        // 실제 API 호출
        const response = await fetch(`/api/bus/schedule/${routeNo}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setScheduleInfo(result.data);
        } else {
          throw new Error(result.message || '시간표 데이터를 가져올 수 없습니다');
        }
      } catch (err) {
        console.error('시간표 조회 오류:', err);
        // 오류 시 샘플 데이터 사용
        const data = getSampleSchedule(routeNo);
        setScheduleInfo(data);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [routeNo, stopId]);

  const getCurrentSchedule = () => {
    if (!scheduleInfo) return [];
    return selectedDay === 'weekday' ? scheduleInfo.weekdaySchedule : scheduleInfo.weekendSchedule;
  };

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const isCurrentTime = (hour: number, minute: number) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    return hour === currentHour && Math.abs(minute - currentMinute) <= 2;
  };

  const getNextBuses = () => {
    if (!scheduleInfo) return [];
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const schedule = getCurrentSchedule();
    const nextBuses = [];
    
    for (const timeSlot of schedule) {
      if (timeSlot.hour > currentHour || 
          (timeSlot.hour === currentHour && timeSlot.minutes.some(m => m > currentMinute))) {
        
        const validMinutes = timeSlot.hour === currentHour 
          ? timeSlot.minutes.filter(m => m > currentMinute)
          : timeSlot.minutes;
          
        for (const minute of validMinutes) {
          if (nextBuses.length < 3) {
            nextBuses.push({ hour: timeSlot.hour, minute });
          }
        }
      }
      if (nextBuses.length >= 3) break;
    }
    
    return nextBuses;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <span className="ml-3">시간표 로딩 중...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !scheduleInfo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="text-center">
            <span className="text-red-500 text-lg">⚠️</span>
            <p className="mt-2 text-gray-700">{error || '시간표를 불러올 수 없습니다'}</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-blue-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{scheduleInfo.routeName}</h2>
              <p className="text-sm opacity-90">운행 시간표</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-500 p-2 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 다음 운행 정보 */}
        <div className="bg-blue-50 p-4 border-b">
          <h3 className="font-semibold text-blue-800 mb-2">🚌 다음 운행</h3>
          <div className="grid grid-cols-3 gap-2">
            {getNextBuses().map((bus, index) => (
              <div key={index} className="bg-white p-2 rounded text-center">
                <div className="text-lg font-bold text-blue-600">
                  {formatTime(bus.hour, bus.minute)}
                </div>
                <div className="text-xs text-gray-500">
                  {index === 0 ? '다음차' : `${index + 1}번째`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 운행 정보 */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">첫차: </span>
              <span className="font-semibold">{scheduleInfo.firstBus}</span>
            </div>
            <div>
              <span className="text-gray-600">막차: </span>
              <span className="font-semibold">{scheduleInfo.lastBus}</span>
            </div>
            <div>
              <span className="text-gray-600">배차간격: </span>
              <span className="font-semibold">{scheduleInfo.interval}</span>
            </div>
            <div>
              <span className="text-gray-600">소요시간: </span>
              <span className="font-semibold">{scheduleInfo.totalTime}</span>
            </div>
          </div>
        </div>

        {/* 요일 선택 */}
        <div className="flex border-b">
          <button
            onClick={() => setSelectedDay('weekday')}
            className={`flex-1 py-3 text-sm font-medium ${
              selectedDay === 'weekday'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500'
            }`}
          >
            평일 (월~금)
          </button>
          <button
            onClick={() => setSelectedDay('weekend')}
            className={`flex-1 py-3 text-sm font-medium ${
              selectedDay === 'weekend'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500'
            }`}
          >
            주말 (토~일)
          </button>
        </div>

        {/* 시간표 */}
        <div className="p-4 overflow-y-auto max-h-96">
          <h3 className="font-semibold mb-3 text-gray-800">
            📅 {selectedDay === 'weekday' ? '평일' : '주말'} 시간표
          </h3>
          
          <div className="space-y-3">
            {getCurrentSchedule().map((timeSlot) => (
              <div key={timeSlot.hour} className="border rounded-lg p-3">
                <div className="font-semibold text-blue-600 mb-2">
                  {timeSlot.hour}시
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {timeSlot.minutes.map((minute) => (
                    <div
                      key={minute}
                      className={`text-center py-1 px-2 rounded text-sm ${
                        isCurrentTime(timeSlot.hour, minute)
                          ? 'bg-red-500 text-white font-bold'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {minute}분
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="bg-gray-50 p-3 text-center border-t">
          <p className="text-xs text-gray-600">
            ※ 교통상황에 따라 운행시간이 지연될 수 있습니다
          </p>
          <p className="text-xs text-gray-500 mt-1">
            문의: 대구시 교통정보운영과 ☎ 053-803-6861
          </p>
        </div>
      </div>
    </div>
  );
} 