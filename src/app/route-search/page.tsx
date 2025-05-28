import { Suspense } from 'react';
import RouteSearchPage from '../../components/RouteSearchPage';

function RouteSearchPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-2xl mb-4">🚌</div>
          <p>경로 검색 페이지 로딩 중...</p>
        </div>
      </div>
    }>
      <RouteSearchPage />
    </Suspense>
  );
}

export default RouteSearchPageWrapper; 