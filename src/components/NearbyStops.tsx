'use client';

import { useState, useEffect } from 'react';
import { getCurrentLocation, getNearbyStops } from '../utils/locationUtils';
import { fetchBusArrivalByRoute, fetchBusArrivalByStopId } from '../utils/fetchBusData';

interface BusStop {
  stopId: string;
  stopName: string;
  gpsX: string;
  gpsY: string;
  distance?: number;
}

interface BusArrival {
  routeNo: string;
  arrivalTime: string;
  remainingSeatCnt: string;
}

export default function NearbyStops() {
  const [stops, setStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [arrivals, setArrivals] = useState<BusArrival[]>([]);
  const [arrivalsLoading, setArrivalsLoading] = useState(false);

  const fetchNearbyStops = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedStop(null);
      setArrivals([]);
      
      const location = await getCurrentLocation();
      const nearbyStops = await getNearbyStops(location);
      
      // 거리 정보 추가
      const stopsWithDistance = nearbyStops.map((stop: any) => {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          parseFloat(stop.gpsY),
          parseFloat(stop.gpsX)
        );
        return { ...stop, distance };
      });
      
      setStops(stopsWithDistance);
    } catch (err) {
      setError(err instanceof Error ? err.message : '위치 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBusArrivals = async (stopId: string) => {
    try {
      setArrivalsLoading(true);
      setSelectedStop(stopId);
      
      try {
        // 실제 API 호출
        const arrivalData = await fetchBusArrivalByStopId(stopId);
        setArrivals(arrivalData);
      } catch (apiError) {
        console.error('API 호출 오류:', apiError);
        
        // API 오류 시 샘플 데이터 사용 (개발용)
        const sampleArrivals = [
          { routeNo: '425', arrivalTime: '5분', remainingSeatCnt: '23' },
          { routeNo: '503', arrivalTime: '12분', remainingSeatCnt: '15' },
          { routeNo: '급행3', arrivalTime: '15분', remainingSeatCnt: '8' },
        ];
        setArrivals(sampleArrivals);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '버스 도착 정보를 가져오는데 실패했습니다.');
    } finally {
      setArrivalsLoading(false);
    }
  };

  // 거리 계산 함수
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // 지구의 반경 (미터)
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // 미터 단위로 반환
  }

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">내 주변 버스 정류장</h2>
      
      <button
        onClick={fetchNearbyStops}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 font-medium"
      >
        {loading ? '위치 정보 가져오는 중...' : '현재 위치에서 주변 정류장 찾기'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {stops.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">
            주변 정류장 {stops.length}개 찾음
          </h3>
          <div className="space-y-3">
            {stops.map((stop) => (
              <div
                key={stop.stopId}
                className={`p-4 rounded-lg border transition-all ${
                  selectedStop === stop.stopId 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-lg">{stop.stopName}</h4>
                    <p className="text-sm text-gray-600">정류장 ID: {stop.stopId}</p>
                    {stop.distance && (
                      <p className="text-sm text-green-600 font-medium">
                        {Math.round(stop.distance)}m 거리
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => fetchBusArrivals(stop.stopId)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-sm"
                  >
                    도착 정보
                  </button>
                </div>

                {selectedStop === stop.stopId && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h5 className="font-medium mb-2">도착 예정 버스</h5>
                    {arrivalsLoading ? (
                      <p className="text-gray-500 text-sm">도착 정보 로딩 중...</p>
                    ) : arrivals.length > 0 ? (
                      <div className="space-y-2">
                        {arrivals.map((arrival, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <span className="inline-block w-12 text-center py-1 bg-blue-100 text-blue-800 font-medium rounded">
                                {arrival.routeNo}
                              </span>
                              <span className="ml-3 text-sm">
                                {arrival.arrivalTime} 후 도착
                              </span>
                            </div>
                            <span className="text-sm font-medium">
                              {arrival.remainingSeatCnt}석
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">도착 예정 버스가 없습니다.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 