import type { NextConfig } from "next";

// 환경변수 확인 (개발 중에는 강제로 dev로 설정)
const isDev = process.env.NEXT_CONFIG === 'dev' || process.env.NODE_ENV === 'development';

console.log('🔧 Next.js Config Debug:');
console.log('NEXT_CONFIG:', process.env.NEXT_CONFIG);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('isDev:', isDev);

const nextConfig: NextConfig = {
  // 배포 환경과 개발 환경 분리
  ...(isDev 
    ? {
        // 개발 환경: API 라우트 사용 가능
        // output 없음 - 동적 라우팅과 API 라우트 사용
        basePath: '',
        assetPrefix: '',
      }
    : {
        // 배포 환경: 정적 사이트 생성
        output: 'export',
        basePath: '/busda',
        assetPrefix: '/busda',
        trailingSlash: true,
        images: {
          unoptimized: true,
        },
      }
  ),
  
  // 공통 설정
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 실험적 기능
  experimental: {
    turbo: {
      rules: {
        '*.scss': {
          loaders: ['sass-loader'],
          as: '*.css',
        },
      },
    },
  },
};

console.log('🚀 Final Config basePath:', nextConfig.basePath || '(none)');
console.log('🚀 Final Config output:', nextConfig.output || '(none)');

export default nextConfig;
