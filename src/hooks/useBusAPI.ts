import { useState, useEffect, useCallback } from 'react';
import { getCurrentLocation } from '@/utils/locationUtils';

interface BusStop {
  stopId: string;
  stopName: string;
  latitude: number;
  longitude: number;
}

interface BusArrival {
  routeNo: string;
  arrivalTime: string;
  remainingSeatCnt: string | number;
  currentLocation: string;
  busNumber: string;
  isRealTime?: boolean;
}

interface BusRoute {
  routeId: string;
  routeNo: string;
  routeType: string;
  startStopName: string;
  endStopName: string;
  regionName?: string;
}

interface APIResponse {
  success: boolean;
  data?: BusArrival[];
  source?: 'official' | 'unofficial' | 'sample';
  message?: string;
  warning?: string;
  error?: string;
  details?: string;
  suggestions?: string[];
}

// 🆕 정류장 API 응답 인터페이스
interface StopsAPIResponse {
  success: boolean;
  data?: BusStop[];
  source?: 'official-basic' | 'official-static' | 'unofficial';
  totalAvailable?: number;
  message?: string;
  apiEndpoint?: string;
  note?: string;
  error?: string;
  details?: string;
  troubleshooting?: string[];
}

interface UseBusAPIResult {
  stops: BusStop[];
  arrivals: BusArrival[];
  routes: BusRoute[];
  loading: boolean;
  error: string | null;
  apiMode: 'official' | 'unofficial' | 'sample';
  apiMessage: string | null;
  apiWarning: string | null;
  refreshData: () => Promise<void>;
  fetchArrivals: (stopId: string) => Promise<void>;
  fetchRoutes: () => Promise<BusRoute[]>;
}

export function useBusAPI(initialRadius = 5000): UseBusAPIResult {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [arrivals, setArrivals] = useState<BusArrival[]>([]);
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiMode, setApiMode] = useState<'official' | 'unofficial' | 'sample'>('official');
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [apiWarning, setApiWarning] = useState<string | null>(null);

  const fetchStops = useCallback(async (latitude: number, longitude: number) => {
    try {
      setError(null);
      setApiMessage(null);
      
      console.log(`🔍 정류장 검색 요청: ${latitude}, ${longitude} (반경: ${initialRadius}m)`);
      
      const response = await fetch(`/api/bus/stops?lat=${latitude}&lng=${longitude}&radius=${initialRadius}`);
      
      if (!response.ok) {
        throw new Error('정류장 정보를 가져오는데 실패했습니다');
      }
      
      const result: StopsAPIResponse = await response.json();
      
      console.log('📊 정류장 API 응답:', result);
      
      // 🆕 새로운 응답 형식 처리
      if (result.success && result.data && Array.isArray(result.data)) {
        setStops(result.data);
        
        // API 소스에 따른 메시지 설정
        if (result.source === 'official-basic') {
          setApiMessage(`✅ 대구시 공식 ${result.totalAvailable}개 정류장 데이터에서 ${result.data.length}개 검색`);
          setApiMode('official');
        } else if (result.source === 'official-static') {
          setApiMessage('📊 공식 정적 데이터 사용 중');
          setApiMode('official');
        } else if (result.source === 'unofficial') {
          setApiMessage('🔄 비공식 API 데이터 사용 중');
          setApiMode('unofficial');
        }
        
        console.log(`✅ 정류장 로드 성공 (${result.source}): ${result.data.length}개`);
        
      } else if (!result.success) {
        // API 실패 응답 처리
        setStops([]);
        setError(result.error || '정류장 정보를 가져오는데 실패했습니다');
        
        if (result.troubleshooting) {
          console.error('문제해결 가이드:', result.troubleshooting);
        }
      } else {
        // 예상치 못한 응답 형식
        console.warn('예상치 못한 API 응답 형식:', result);
        
        // 기존 배열 형식과의 하위 호환성 체크
        if (Array.isArray(result)) {
          console.log('🔄 기존 배열 형식으로 처리');
          setStops(result as BusStop[]);
          setApiMessage('📊 정적 데이터 사용');
        } else {
          setStops([]);
          setError('정류장 데이터 형식이 올바르지 않습니다');
        }
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      setError(errorMessage);
      setStops([]);
      console.error('정류장 데이터 로드 실패:', error);
    }
  }, [initialRadius]);

  const fetchArrivals = useCallback(async (stopId: string) => {
    try {
      setError(null);
      setApiMessage(null);
      setApiWarning(null);
      
      const response = await fetch(`/api/bus/arrivals/${stopId}`);
      const result: APIResponse = await response.json();
      
      if (!response.ok) {
        // API 응답이 성공하지 않은 경우
        throw new Error(result.error || '도착 정보를 가져오는데 실패했습니다');
      }
      
      if (result.success && result.data) {
        // 성공적으로 데이터를 받은 경우
        setArrivals(result.data);
        setApiMode(result.source || 'official');
        setApiMessage(result.message || null);
        setApiWarning(result.warning || null);
        
        console.log(`✅ 도착정보 로드 성공 (${result.source}):`, result.data.length, '개');
      } else {
        // API 응답은 받았지만 데이터가 없는 경우
        setArrivals([]);
        setError(result.error || '도착 정보가 없습니다');
        if (result.suggestions) {
          console.log('해결 방법:', result.suggestions);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      setError(errorMessage);
      setArrivals([]);
      console.error('도착정보 로드 실패:', error);
    }
  }, []);

  const fetchRoutes = useCallback(async (): Promise<BusRoute[]> => {
    try {
      setError(null);
      setApiMessage(null);
      setApiWarning(null);
      
      console.log('🚌 노선 정보 로드 시작...');
      
      const response = await fetch('/api/bus/routes');
      
      if (!response.ok) {
        throw new Error('노선 정보를 가져오는데 실패했습니다');
      }
      
      const result = await response.json();
      
      if (result.success && result.data && Array.isArray(result.data)) {
        setRoutes(result.data);
        setApiMessage(`✅ ${result.data.length}개 노선 정보 로드 완료`);
        console.log(`✅ 노선 정보 로드 성공: ${result.data.length}개`);
        return result.data;
      } else {
        // 샘플 데이터 반환
        const sampleRoutes: BusRoute[] = [
          {
            routeId: 'sample_001',
            routeNo: '425',
            routeType: '시내버스',
            startStopName: '달서구청',
            endStopName: '대구역',
            regionName: '달서구'
          },
          {
            routeId: 'sample_002', 
            routeNo: '349',
            routeType: '시내버스',
            startStopName: '동대구역',
            endStopName: '서문시장',
            regionName: '중구'
          }
        ];
        
        setRoutes(sampleRoutes);
        setApiMessage('📊 샘플 노선 데이터 사용 중');
        setApiWarning('현재 노선 API가 준비되지 않아 샘플 데이터를 보여드립니다.');
        console.log('⚠️ 노선 API 응답 실패, 샘플 데이터 사용');
        return sampleRoutes;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      console.error('노선 정보 로드 실패:', error);
      
      // 에러 발생 시 빈 배열 반환
      setRoutes([]);
      setError(errorMessage);
      return [];
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setApiMessage(null);
    setApiWarning(null);
    setArrivals([]); // 기존 도착 정보 초기화

    try {
      const { latitude, longitude } = await getCurrentLocation();
      await fetchStops(latitude, longitude);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '위치 정보를 가져오는데 실패했습니다';
      setError(errorMessage);
      console.error('위치 기반 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchStops]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    refreshData();
  }, []);

  return {
    stops,
    arrivals,
    routes,
    loading,
    error,
    apiMode,
    apiMessage,
    apiWarning,
    refreshData,
    fetchArrivals,
    fetchRoutes
  };
} 