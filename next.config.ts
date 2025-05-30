import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_DAEGU_API_KEY: "Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D",
  },
  output: 'export',  // GitHub Pages 배포를 위해 정적 export 활성화
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '/busda',  // GitHub Pages 저장소 이름에 맞게 설정
  assetPrefix: '/busda',  // 정적 자산 경로 설정
  eslint: {
    ignoreDuringBuilds: true,  // 배포 시 ESLint 검사 무시
  },
  typescript: {
    ignoreBuildErrors: true,  // 배포 시 TypeScript 에러 무시
  },
};

export default nextConfig;
