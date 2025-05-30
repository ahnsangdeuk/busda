import { Suspense } from 'react';
import BusArrivalBoard from '../../../components/BusArrivalBoard';
import Link from 'next/link';

// 정적 export를 위한 generateStaticParams 함수
export async function generateStaticParams() {
  // 일반적인 노선 번호들을 미리 생성
  return [
    { routeNo: '101' },
    { routeNo: '102' },
    { routeNo: '급행1' },
    { routeNo: 'sample' },
  ];
}

interface Props {
  params: Promise<{
    routeNo: string;
  }>;
}

function ArrivalBoardWrapper({ routeNo }: { routeNo: string }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 네비게이션 */}
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:bg-blue-500 p-2 rounded-lg transition-colors">
              <span className="text-xl">🏠</span>
            </Link>
            <h1 className="text-xl font-bold">버스 도착정보 전광판</h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">실시간 도착정보</div>
            <div className="font-bold">{decodeURIComponent(routeNo)}번 버스</div>
          </div>
        </div>
      </nav>

      {/* 전광판 컴포넌트 */}
      <div className="py-8">
        <BusArrivalBoard routeNo={decodeURIComponent(routeNo)} />
      </div>

      {/* 하단 정보 */}
      <footer className="bg-blue-600 text-white text-center py-6">
        <div className="text-sm">
          <p>대구광역시 버스정보시스템 | 실시간 도착정보 서비스</p>
          <p className="mt-2 text-blue-200">30초마다 자동 업데이트됩니다</p>
        </div>
      </footer>
    </div>
  );
}

export default async function ArrivalPage({ params }: Props) {
  const { routeNo } = await params;
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚌</div>
          <p className="text-xl text-gray-600">버스 도착정보를 불러오는 중...</p>
        </div>
      </div>
    }>
      <ArrivalBoardWrapper routeNo={routeNo} />
    </Suspense>
  );
} 