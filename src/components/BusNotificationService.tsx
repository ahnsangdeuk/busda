import React, { useEffect, useState } from 'react';

interface BusArrival {
  routeNo: string;
  arrivalTime: string;
  remainingSeatCnt: string | number;
  currentLocation: string;
  busNumber: string;
  isRealTime?: boolean;
}

interface BusNotificationServiceProps {
  arrivals: BusArrival[];
  selectedStopName?: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function BusNotificationService({ 
  arrivals, 
  selectedStopName, 
  enabled, 
  onToggle 
}: BusNotificationServiceProps) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [lastNotifiedBuses, setLastNotifiedBuses] = useState<Set<string>>(new Set());

  // 알림 권한 확인 및 요청
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // 알림 권한 요청
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  // 도착 시간 파싱 (분 단위로 변환)
  const parseArrivalTime = (timeStr: string) => {
    const match = timeStr.match(/(\d+)분/);
    return match ? parseInt(match[1]) : null;
  };

  // 브라우저 알림 생성
  const showNotification = (routeNo: string, arrivalTime: string, stopName: string) => {
    if (notificationPermission === 'granted') {
      const notification = new Notification(`🚌 ${routeNo}번 버스 도착 임박!`, {
        body: `${arrivalTime}에 ${stopName}에 도착 예정입니다.`,
        icon: '/favicon.ico',
        tag: `bus-${routeNo}`, // 동일한 버스의 중복 알림 방지
        requireInteraction: true // 사용자가 직접 닫을 때까지 유지
      } as NotificationOptions);

      // 알림 클릭 시 창 포커스
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // 10초 후 자동 닫기
      setTimeout(() => {
        notification.close();
      }, 10000);
    }
  };

  // 알림음 재생
  const playNotificationSound = () => {
    try {
      // Web Audio API를 사용한 간단한 알림음 생성
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('알림음 재생 실패:', error);
    }
  };

  // 도착 정보 모니터링 및 알림 처리
  useEffect(() => {
    if (!enabled || !arrivals.length) return;

    const currentNotifiedBuses = new Set<string>();

    arrivals.forEach((arrival) => {
      const arrivalMinutes = parseArrivalTime(arrival.arrivalTime);
      const busKey = `${arrival.routeNo}-${arrival.busNumber}`;

      // 3분 이내 도착하는 버스에 대해 알림
      if (arrivalMinutes !== null && arrivalMinutes <= 3 && arrivalMinutes > 0) {
        // 이미 알림을 보낸 버스가 아닌 경우에만 알림
        if (!lastNotifiedBuses.has(busKey)) {
          const stopName = selectedStopName || '선택된 정류장';
          
          // 브라우저 알림
          showNotification(arrival.routeNo, arrival.arrivalTime, stopName);
          
          // 알림음 재생
          playNotificationSound();
          
          currentNotifiedBuses.add(busKey);
          
          console.log(`🔔 알림 발송: ${arrival.routeNo}번 버스 ${arrival.arrivalTime} 도착 예정`);
        }
      }
    });

    // 알림을 보낸 버스 목록 업데이트
    if (currentNotifiedBuses.size > 0) {
      setLastNotifiedBuses(prev => new Set([...prev, ...currentNotifiedBuses]));
    }

    // 5분마다 알림 기록 초기화 (동일한 버스에 대해 재알림 가능)
    const cleanupTimer = setTimeout(() => {
      setLastNotifiedBuses(new Set());
    }, 5 * 60 * 1000);

    return () => clearTimeout(cleanupTimer);
  }, [arrivals, enabled, selectedStopName, lastNotifiedBuses]);

  return (
    <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-purple-800">🔔 버스 도착 알림</h4>
        <button
          onClick={() => onToggle(!enabled)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            enabled
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {enabled ? '알림 ON' : '알림 OFF'}
        </button>
      </div>

      <div className="text-sm text-purple-700 space-y-1">
        <p>• 3분 이내 도착하는 버스에 대해 자동으로 알림을 보내드립니다</p>
        <p>• 브라우저 알림과 알림음으로 놓치지 않게 도와드려요</p>
        
        {enabled && notificationPermission !== 'granted' && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-yellow-800 text-xs mb-1">
              ⚠️ 브라우저 알림 권한이 필요합니다
            </p>
            <button
              onClick={requestNotificationPermission}
              className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors"
            >
              권한 허용하기
            </button>
          </div>
        )}

        {enabled && notificationPermission === 'granted' && (
          <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded">
            <p className="text-green-800 text-xs">
              ✅ 알림이 활성화되었습니다. 3분 이내 도착하는 버스를 놓치지 마세요!
            </p>
          </div>
        )}

        {enabled && notificationPermission === 'denied' && (
          <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded">
            <p className="text-red-800 text-xs">
              ❌ 알림 권한이 차단되었습니다. 브라우저 설정에서 알림을 허용해주세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 