import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_DAEGU_API_KEY: "Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D",
  },
  // output: 'export',  // 개발 중에는 주석 처리 (API 라우트 사용을 위해)
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // basePath: '/busda',  // 개발 중에는 주석 처리
  // assetPrefix: '/busda',  // 개발 중에는 주석 처리
};

export default nextConfig;
