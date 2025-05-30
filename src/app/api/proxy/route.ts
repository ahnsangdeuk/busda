import { NextRequest, NextResponse } from 'next/server';

// API 라우트를 동적으로 설정 (정적 export와 호환)
export const dynamic = 'force-dynamic';

// API 키를 직접 할당 (이미 인코딩된 상태)
const API_KEY = "Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D";

export async function GET(request: NextRequest) {
  // URL 파라미터에서 엔드포인트와 쿼리 파라미터 추출
  const searchParams = request.nextUrl.searchParams;
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint parameter is required' }, { status: 400 });
  }

  try {
    // API 엔드포인트 URL 생성
    const baseUrl = 'https://apis.data.go.kr/6270000/dbmsapi01';
    
    // URL을 문자열로 구성 (URL 객체를 사용하지 않음)
    let urlString = `${baseUrl}/${endpoint}?serviceKey=${API_KEY}`;
    
    // 모든 쿼리 파라미터 추가 (endpoint 제외)
    searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        urlString += `&${key}=${encodeURIComponent(value)}`;
      }
    });
    
    // JSON 타입 파라미터 추가
    urlString += '&type=json';
    
    console.log('요청 URL:', urlString);
    
    // 외부 API 호출
    const response = await fetch(urlString, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('외부 API 응답 에러:', errorText);
      
      // XML 응답인 경우 에러 메시지 추출 시도
      let errorMessage = `External API error: ${response.status} ${response.statusText}`;
      if (errorText.includes('<faultstring>')) {
        const match = errorText.match(/<faultstring>(.*?)<\/faultstring>/);
        if (match && match[1]) {
          errorMessage += ` - ${match[1]}`;
        }
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('프록시 오류:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from external API', details: (error as Error).message },
      { status: 500 }
    );
  }
} 