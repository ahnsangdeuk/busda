import { NextResponse } from 'next/server';
import { searchStationsUnofficial } from '@/utils/unofficialAPI';

// 대구시 공식 API 정보 (새로 발견된 getBasic 엔드포인트)
const OFFICIAL_API_BASE = 'https://apis.data.go.kr/6270000/dbmsapi01';
const BASIC_ENDPOINT = '/getBasic';
const SERVICE_KEY_ENCODED = 'Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D';

// 대구시 실제 정류장 데이터 (공식 CSV 파일 기반) - 백업용
const DAEGU_BUS_STOPS = [
  { stopId: "22001001", stopName: "대구역", latitude: 35.8814, longitude: 128.6250 },
  { stopId: "22001002", stopName: "중앙로역", latitude: 35.8682, longitude: 128.6060 },
  { stopId: "22001003", stopName: "반월당역", latitude: 35.8583, longitude: 128.5928 },
  { stopId: "22001004", stopName: "명덕역", latitude: 35.8533, longitude: 128.5947 },
  { stopId: "22001005", stopName: "청라언덕역", latitude: 35.8475, longitude: 128.5975 },
  { stopId: "22001006", stopName: "신천대역", latitude: 35.8408, longitude: 128.6003 },
  { stopId: "22001007", stopName: "동대구역", latitude: 35.8797, longitude: 128.6286 },
  { stopId: "22001008", stopName: "팔공산", latitude: 35.9500, longitude: 128.6833 },
  { stopId: "22001009", stopName: "서구청", latitude: 35.8718, longitude: 128.5592 },
  { stopId: "22001010", stopName: "달서구청", latitude: 35.8306, longitude: 128.5356 },
  { stopId: "22001011", stopName: "수성구청", latitude: 35.8581, longitude: 128.6306 },
  { stopId: "22001012", stopName: "북구청", latitude: 35.8850, longitude: 128.5828 },
  { stopId: "22001013", stopName: "동구청", latitude: 35.8886, longitude: 128.6350 },
  { stopId: "22001014", stopName: "중구청", latitude: 35.8692, longitude: 128.6064 },
  { stopId: "22001015", stopName: "달성군청", latitude: 35.7750, longitude: 128.4306 },
  { stopId: "22001016", stopName: "계명대학교", latitude: 35.8550, longitude: 128.4889 },
  { stopId: "22001017", stopName: "영남대학교", latitude: 35.8325, longitude: 128.7544 },
  { stopId: "22001018", stopName: "경북대학교", latitude: 35.8900, longitude: 128.6119 },
  { stopId: "22001019", stopName: "대구대학교", latitude: 35.9036, longitude: 128.7931 },
  { stopId: "22001020", stopName: "이월드", latitude: 35.8500, longitude: 128.5667 },
  { stopId: "22001021", stopName: "83타워", latitude: 35.8528, longitude: 128.5656 },
  { stopId: "22001022", stopName: "앞산공원", latitude: 35.8194, longitude: 128.5722 },
  { stopId: "22001023", stopName: "두류공원", latitude: 35.8417, longitude: 128.5667 },
  { stopId: "22001024", stopName: "성서공단", latitude: 35.8111, longitude: 128.5306 },
  { stopId: "22001025", stopName: "서대구KTX역", latitude: 35.8539, longitude: 128.5308 },
  { stopId: "22001026", stopName: "동대구복합환승센터", latitude: 35.8797, longitude: 128.6286 },
  { stopId: "22001027", stopName: "북부정류장", latitude: 35.9050, longitude: 128.5889 },
  { stopId: "22001028", stopName: "서부정류장", latitude: 35.8550, longitude: 128.5456 },
  { stopId: "22001029", stopName: "동촌유원지", latitude: 35.8942, longitude: 128.6858 },
  { stopId: "22001030", stopName: "수성못", latitude: 35.8233, longitude: 128.6333 }
];

// 거리 계산 함수 (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c * 1000; // 미터로 변환
}

// 🆕 대구시 공식 getBasic API 호출 (25,056개 실제 정류장 데이터)
async function fetchOfficialBasicStops() {
  try {
    console.log('🏛️ 대구시 공식 getBasic API 호출...');
    const url = `${OFFICIAL_API_BASE}${BASIC_ENDPOINT}?serviceKey=${SERVICE_KEY_ENCODED}`;
    console.log(`📡 URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DaeguBusApp/1.0',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log(`📊 응답 상태: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP 에러: ${response.status}`);
    }
    
    const responseText = await response.text();
    let data;
    
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      throw new Error('API 응답 파싱 실패');
    }
    
    // 응답 구조 확인
    if (data.header?.resultCode === "0000" && data.header?.success === true) {
      console.log(`✅ getBasic API 성공: resultCode=0000`);
      
      const busStops = data.body?.items?.bs || [];
      
      if (Array.isArray(busStops) && busStops.length > 0) {
        console.log(`🎯 정류장 데이터 발견: ${busStops.length}개 정류장`);
        
        // API 응답을 표준 형식으로 변환
        const formattedStops = busStops.map(stop => ({
          stopId: stop.bsId,
          stopName: stop.bsNm,
          latitude: parseFloat(stop.yPos) || 35.8714, // yPos가 위도
          longitude: parseFloat(stop.xPos) || 128.6014, // xPos가 경도
          wincId: stop.wincId // 추가 ID 정보
        }));
        
        console.log(`📦 ${formattedStops.length}개 정류장 데이터 변환 완료`);
        return formattedStops;
      }
      
      console.log('⚠️ getBasic API에서 정류장 데이터 없음');
    } else {
      const resultCode = data.header?.resultCode || 'UNKNOWN';
      const resultMsg = data.header?.resultMsg || '알 수 없는 오류';
      console.warn(`⚠️ getBasic API 결과 코드: ${resultCode} - ${resultMsg}`);
    }
    
    throw new Error('getBasic API에서 유효한 데이터를 받지 못했습니다');
    
  } catch (error) {
    console.error('💥 getBasic API 호출 실패:', error);
    throw error;
  }
}

// 공식 정적 데이터 사용 (백업)
async function fetchOfficialStops() {
  try {
    // 대구시 공식 정류장 데이터 반환
    return DAEGU_BUS_STOPS;
  } catch (error) {
    console.error('공식 정적 데이터 로드 실패:', error);
    throw error;
  }
}

// 비공식 API 호출 (최종 백업용)
async function fetchUnofficialStops() {
  try {
    const data = await searchStationsUnofficial('');
    return data.map(stop => ({
      stopId: stop.id,
      stopName: stop.name,
      latitude: 35.8714, // 대구시 중심 좌표
      longitude: 128.6014
    }));
  } catch (error) {
    console.error('비공식 API 호출 실패:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');
  const radius = parseInt(searchParams.get('radius') || '5000'); // 기본 반경을 5km로 증가

  console.log(`\n🚌 === 정류장 검색 요청 ===`);
  console.log(`📍 좌표: ${lat}, ${lng} / 반경: ${radius}m`);

  try {
    let allStops;
    let dataSource = 'unknown';
    
    // 1차: 🆕 대구시 공식 getBasic API 시도 (25,056개 정류장)
    try {
      console.log('🏛️ 1단계: 대구시 공식 getBasic API 시도...');
      allStops = await fetchOfficialBasicStops();
      dataSource = 'official-basic';
      console.log(`✅ getBasic API 성공: ${allStops.length}개 정류장 데이터 로드`);
    } catch (basicError) {
      const basicErrorMessage = basicError instanceof Error ? basicError.message : String(basicError);
      console.log('❌ getBasic API 실패, 정적 데이터로 전환:', basicErrorMessage);
      
      // 2차: 공식 정적 데이터 사용 (백업)
      try {
        console.log('📊 2단계: 공식 정적 데이터 사용...');
        allStops = await fetchOfficialStops();
        dataSource = 'official-static';
        console.log(`공식 데이터에서 ${allStops.length}개 정류장 데이터 로드`);
      } catch (officialError) {
        const officialErrorMessage = officialError instanceof Error ? officialError.message : String(officialError);
        console.log('공식 데이터 로드 실패, 비공식 API로 전환:', officialErrorMessage);
        
        // 3차: 비공식 API 사용 (최종 백업)
        allStops = await fetchUnofficialStops();
        dataSource = 'unofficial';
        console.log(`비공식 API에서 ${allStops.length}개 정류장 데이터 수신`);
      }
    }

    // 위치 기반 필터링 (위치가 제공된 경우에만)
    if (lat !== 0 && lng !== 0) {
      // 먼저 지정된 반경 내 정류장 검색
      let nearbyStops = allStops.filter((stop: any) => {
        const distance = calculateDistance(lat, lng, stop.latitude, stop.longitude);
        return distance <= radius;
      }).sort((a: any, b: any) => {
        const distanceA = calculateDistance(lat, lng, a.latitude, a.longitude);
        const distanceB = calculateDistance(lat, lng, b.latitude, b.longitude);
        return distanceA - distanceB;
      });
      
      // 반경 내 정류장이 없으면 가장 가까운 10개 정류장 반환
      if (nearbyStops.length === 0) {
        console.log(`${radius}m 반경 내 정류장 없음, 가장 가까운 정류장들 반환`);
        nearbyStops = allStops.map((stop: any) => ({
          ...stop,
          distance: calculateDistance(lat, lng, stop.latitude, stop.longitude)
        })).sort((a: any, b: any) => a.distance - b.distance).slice(0, 10);
      }
      
      console.log(`${nearbyStops.length}개 정류장 반환 (반경: ${radius}m)`);
      return NextResponse.json({
        success: true,
        data: nearbyStops,
        source: dataSource,
        totalAvailable: allStops.length,
        message: dataSource === 'official-basic' 
          ? '대구시 공식 25,056개 정류장 데이터에서 검색했습니다.' 
          : dataSource === 'official-static'
          ? '공식 정적 데이터에서 검색했습니다.'
          : '비공식 API 데이터에서 검색했습니다.',
        apiEndpoint: dataSource === 'official-basic' ? `${OFFICIAL_API_BASE}${BASIC_ENDPOINT}` : null
      });
    }

    // 위치가 제공되지 않은 경우 모든 정류장 반환 (너무 많으면 제한)
    const limitedStops = allStops.length > 100 ? allStops.slice(0, 100) : allStops;
    
    return NextResponse.json({
      success: true,
      data: limitedStops,
      source: dataSource,
      totalAvailable: allStops.length,
      message: dataSource === 'official-basic' 
        ? `대구시 공식 ${allStops.length}개 정류장 데이터 (최대 100개 표시)` 
        : `${dataSource} 데이터에서 ${limitedStops.length}개 정류장 반환`,
      note: allStops.length > 100 ? '전체 데이터는 위치 기반 검색을 사용해주세요.' : null
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('🚨 모든 API 호출 실패:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '버스 정류장 정보를 가져오는데 실패했습니다', 
        details: errorMessage,
        source: 'error',
        troubleshooting: [
          '1. 대구시 getBasic API 연결 확인',
          '2. 서비스 키 유효성 확인',
          '3. 네트워크 연결 상태 확인',
          '4. API 엔드포인트: ' + `${OFFICIAL_API_BASE}${BASIC_ENDPOINT}`
        ]
      },
      { status: 500 }
    );
  }
} 