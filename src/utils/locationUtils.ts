interface Location {
  latitude: number;
  longitude: number;
}

export async function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('이 브라우저는 위치 정보를 지원하지 않습니다.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = '위치 정보를 가져올 수 없습니다.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 정보 접근이 거부되었습니다. 브라우저 설정에서 위치 정보 접근을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 정보 요청 시간이 초과되었습니다.';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

export async function getNearbyStops(location: Location, radius: number = 500) {
  try {
    // 프록시 API를 통해 정류장 정보 요청
    const url = `/api/proxy?endpoint=busStopList&cityCode=22&pageNo=1&numOfRows=1000`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API 응답 에러:', errorText);
      throw new Error(`정류장 정보 API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.body || !data.body.items) {
      console.error('예상치 못한 응답 형식:', data);
      throw new Error('API 응답 형식이 올바르지 않습니다.');
    }

    console.log('정류장 데이터 받음:', data.body.totalCount);

    // 현재 위치 기준으로 반경 내 정류장 필터링
    const nearbyStops = data.body.items.filter((stop: any) => {
      // GPS 좌표가 있는 정류장만 처리
      if (!stop.gpsY || !stop.gpsX) return false;
      
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        parseFloat(stop.gpsY),
        parseFloat(stop.gpsX)
      );
      return distance <= radius;
    });

    // 거리 순으로 정렬
    nearbyStops.sort((a: any, b: any) => {
      const distanceA = calculateDistance(
        location.latitude, 
        location.longitude, 
        parseFloat(a.gpsY), 
        parseFloat(a.gpsX)
      );
      const distanceB = calculateDistance(
        location.latitude, 
        location.longitude, 
        parseFloat(b.gpsY), 
        parseFloat(b.gpsX)
      );
      return distanceA - distanceB;
    });

    return nearbyStops;
  } catch (error) {
    console.error('주변 정류장 조회 중 오류:', error);
    throw error;
  }
}

// Haversine 공식을 사용한 두 지점 간의 거리 계산 (단위: 미터)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // 지구의 반지름 (미터)
  const φ1 = lat1 * Math.PI / 180; // φ, λ는 라디안
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 미터 단위 거리
}

// 주어진 위치에서 반경 내의 정류장들을 찾아서 거리별로 정렬
export function findNearbyStops<T extends {
  stopId: string;
  stopName: string;
  gpsX: string;
  gpsY: string;
}>(
  userLat: number,
  userLon: number,
  allStops: T[],
  radiusInMeters: number = 500
): (T & { distance: number })[] {
  const nearbyStops = allStops
    .map(stop => {
      const stopLat = parseFloat(stop.gpsY);
      const stopLon = parseFloat(stop.gpsX);
      
      // GPS 좌표가 유효한지 확인
      if (isNaN(stopLat) || isNaN(stopLon)) {
        return null;
      }
      
      const distance = calculateDistance(userLat, userLon, stopLat, stopLon);
      
      return {
        ...stop,
        distance: Math.round(distance)
      };
    })
    .filter((stop): stop is T & { distance: number } => 
      stop !== null && stop.distance <= radiusInMeters
    )
    .sort((a, b) => a.distance - b.distance);

  return nearbyStops;
} 