import { Suspense } from 'react';
import BusStopDetailPage from '../../components/BusStopDetailPage';

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-xl text-gray-600">검색 페이지를 불러오는 중...</p>
        </div>
      </div>
    }>
      <BusStopDetailPage />
    </Suspense>
  );
} 