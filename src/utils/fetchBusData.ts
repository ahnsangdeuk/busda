export async function fetchBusArrivalByRoute(routeNo: string) {
  try {
    const url = `/api/proxy?endpoint=busArrivalList&cityCode=22&busRouteNo=${encodeURIComponent(routeNo)}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API 응답 에러:', errorText);
      throw new Error(`API 호출 실패: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!data.body || !data.body.items) {
      throw new Error('API 응답 형식이 올바르지 않습니다.');
    }

    return data.body.items;
  } catch (error) {
    console.error('버스 정보 조회 중 오류 발생:', error);
    throw error;
  }
}

// 정류장 ID로 버스 도착 정보 조회
export async function fetchBusArrivalByStopId(stopId: string) {
  try {
    const url = `/api/proxy?endpoint=busArrivalInfoList&cityCode=22&busStopId=${encodeURIComponent(stopId)}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store', // 항상 최신 데이터 가져오기
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API 응답 에러:', errorText);
      throw new Error(`정류장 API 호출 실패: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!data.body || !data.body.items) {
      console.error('예상치 못한 응답 형식:', data);
      throw new Error('API 응답 형식이 올바르지 않습니다.');
    }

    // 도착 정보 형식 변환 (API 응답 구조에 따라 조정 필요)
    const arrivals = data.body.items.map((item: any) => ({
      routeNo: item.routeNo,
      arrivalTime: `${item.predictTime1}분`,
      remainingSeatCnt: item.remainSeatCnt1 || '정보 없음'
    }));

    return arrivals;
  } catch (error) {
    console.error('버스 도착 정보 조회 중 오류 발생:', error);
    throw error;
  }
} 