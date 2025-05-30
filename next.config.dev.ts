import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_DAEGU_API_KEY: "Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D",
  },
  // 개발 환경에서는 API 라우트 사용 가능
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // basePath와 assetPrefix는 개발 시 주석 처리
  // basePath: '/busda',
  // assetPrefix: '/busda',
};

export default nextConfig; 