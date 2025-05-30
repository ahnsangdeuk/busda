import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 대구시 주요 노선 목록
const DAEGU_BUS_ROUTES = [
  { routeId: 'route_101', routeNo: '101', routeType: '간선', startStopName: '대구역', endStopName: '동대구역', regionName: '중구' },
  { routeId: 'route_102', routeNo: '102', routeType: '간선', startStopName: '반월당', endStopName: '칠성시장', regionName: '중구' },
  { routeId: 'route_303', routeNo: '303', routeType: '간선', startStopName: '명덕역', endStopName: '청라언덕역', regionName: '중구' },
  { routeId: 'route_564', routeNo: '564', routeType: '지선', startStopName: '팔공산', endStopName: '중앙로역', regionName: '동구' },
  { routeId: 'route_급행1', routeNo: '급행1', routeType: '급행', startStopName: '서구청', endStopName: '수성구청', regionName: '서구' },
  { routeId: 'route_급행2', routeNo: '급행2', routeType: '급행', startStopName: '달서구청', endStopName: '동구청', regionName: '달서구' },
  { routeId: 'route_달서1', routeNo: '달서1', routeType: '달성', startStopName: '달서구청', endStopName: '현풍면', regionName: '달서구' },
  { routeId: 'route_수성1', routeNo: '수성1', routeType: '수성', startStopName: '수성구청', endStopName: '범어동', regionName: '수성구' },
  { routeId: 'route_순환1', routeNo: '순환1', routeType: '순환', startStopName: '대구역', endStopName: '대구역', regionName: '중구' },
  { routeId: 'route_순환2', routeNo: '순환2', routeType: '순환', startStopName: '동대구역', endStopName: '동대구역', regionName: '동구' },
  { routeId: 'route_410', routeNo: '410', routeType: '지선', startStopName: '북구청', endStopName: '칠곡', regionName: '북구' },
  { routeId: 'route_425', routeNo: '425', routeType: '지선', startStopName: '달서구청', endStopName: '성서공단', regionName: '달서구' },
  { routeId: 'route_650', routeNo: '650', routeType: '지선', startStopName: '수성구청', endStopName: '대공원', regionName: '수성구' },
  { routeId: 'route_990', routeNo: '990', routeType: '심야', startStopName: '대구역', endStopName: '동대구역', regionName: '중구' },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const routeType = searchParams.get('routeType');
    const region = searchParams.get('region');
    
    console.log(`🚌 노선 목록 조회 요청: type=${routeType}, region=${region}`);

    let filteredRoutes = DAEGU_BUS_ROUTES;

    // 노선 타입 필터링
    if (routeType && routeType !== 'all') {
      filteredRoutes = filteredRoutes.filter(route => route.routeType === routeType);
    }

    // 지역 필터링
    if (region && region !== 'all') {
      filteredRoutes = filteredRoutes.filter(route => route.regionName === region);
    }

    return NextResponse.json({
      success: true,
      data: filteredRoutes,
      totalRoutes: filteredRoutes.length,
      message: `${filteredRoutes.length}개의 노선 정보를 찾았습니다.`,
      filters: {
        routeType: routeType || 'all',
        region: region || 'all'
      },
      source: 'local_data'
    });

  } catch (error) {
    console.error('노선 목록 조회 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '노선 목록을 가져오는 중 오류가 발생했습니다.',
      data: []
    }, { status: 500 });
  }
} 