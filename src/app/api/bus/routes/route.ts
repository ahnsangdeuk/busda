import { NextRequest, NextResponse } from 'next/server';

// API 라우트를 동적으로 설정 (정적 export와 호환)
export const dynamic = 'force-dynamic';

interface BusRoute {
  routeId: string;
  routeNo: string;
  routeType: string;
  startStopName: string;
  endStopName: string;
  regionName?: string;
}

export async function GET(req: NextRequest) {
  try {
    console.log('🚌 노선 목록 API 호출');
    
    // TODO: 실제 대구시 노선 API 연동
    // 현재는 샘플 데이터 사용
    const sampleRoutes: BusRoute[] = [
      {
        routeId: 'DG_425',
        routeNo: '425',
        routeType: '시내버스',
        startStopName: '달서구청',
        endStopName: '대구역',
        regionName: '달서구'
      },
      {
        routeId: 'DG_349',
        routeNo: '349',
        routeType: '시내버스',
        startStopName: '동대구역',
        endStopName: '서문시장',
        regionName: '중구'
      },
      {
        routeId: 'DG_101',
        routeNo: '101',
        routeType: '시내버스',
        startStopName: '북구청',
        endStopName: '칠곡운암역',
        regionName: '북구'
      },
      {
        routeId: 'DG_급행1',
        routeNo: '급행1',
        routeType: '급행버스',
        startStopName: '수성구청',
        endStopName: '대구공항',
        regionName: '수성구'
      },
      {
        routeId: 'DG_503',
        routeNo: '503',
        routeType: '시내버스',
        startStopName: '동구청',
        endStopName: '안심역',
        regionName: '동구'
      },
      {
        routeId: 'DG_724',
        routeNo: '724',
        routeType: '시내버스',
        startStopName: '서구청',
        endStopName: '내당역',
        regionName: '서구'
      },
      {
        routeId: 'DG_202',
        routeNo: '202',
        routeType: '시내버스',
        startStopName: '남구청',
        endStopName: '대명역',
        regionName: '남구'
      },
      {
        routeId: 'DG_순환2',
        routeNo: '순환2',
        routeType: '순환버스',
        startStopName: '반월당',
        endStopName: '반월당',
        regionName: '중구'
      }
    ];

    console.log(`✅ 샘플 노선 데이터 반환: ${sampleRoutes.length}개`);

    return NextResponse.json({
      success: true,
      data: sampleRoutes,
      source: 'sample',
      message: `${sampleRoutes.length}개 노선 정보 로드 완료`,
      note: '현재 샘플 데이터를 사용 중입니다. 추후 대구시 공식 API 연동 예정'
    });

  } catch (error) {
    console.error('노선 목록 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      data: [],
      error: '노선 정보를 가져오는데 실패했습니다',
      details: error instanceof Error ? error.message : '알 수 없는 오류'
    }, { status: 500 });
  }
} 