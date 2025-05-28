'use client';

import { useState } from 'react';

export default function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const apiEndpoints = [
    { name: '정류장 목록', endpoint: 'busStopList', params: 'cityCode=22&pageNo=1&numOfRows=10' },
    { name: '버스 노선 목록', endpoint: 'routeList', params: 'cityCode=22&pageNo=1&numOfRows=10' },
    { name: '버스 도착 정보', endpoint: 'busArrivalInfoList', params: 'cityCode=22&busStopId=1234' },
  ];

  const testApi = async (endpoint: string, params: string) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const url = `/api/proxy?endpoint=${endpoint}&${params}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">API 테스트</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {apiEndpoints.map((api) => (
          <button
            key={api.endpoint}
            onClick={() => testApi(api.endpoint, api.params)}
            disabled={loading}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {api.name} 테스트
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">로딩 중...</p>}

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          <h3 className="font-bold">오류 발생:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">API 응답 결과:</h3>
          <div className="bg-gray-100 p-3 rounded overflow-auto max-h-96">
            <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 