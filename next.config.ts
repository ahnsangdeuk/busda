import type { NextConfig } from "next";

// 환경별 설정 분리
const isVercel = process.env.VERCEL === '1';
const isDev = process.env.NEXT_CONFIG === 'dev' || process.env.NODE_ENV === 'development';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true' && !isVercel;

console.log('🔧 Next.js Config Debug:');
console.log('VERCEL:', process.env.VERCEL);
console.log('GITHUB_ACTIONS:', process.env.GITHUB_ACTIONS);
console.log('NEXT_CONFIG:', process.env.NEXT_CONFIG);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('isVercel:', isVercel);
console.log('isDev:', isDev);
console.log('isGitHubPages:', isGitHubPages);

const nextConfig: NextConfig = {
  // 환경별 설정
  ...(isVercel || isDev
    ? {
        // Vercel 또는 개발 환경: API 라우트 사용 가능
        // output 없음 - 동적 라우팅과 API 라우트 사용
        basePath: '',
        assetPrefix: '',
      }
    : {
        // GitHub Pages: 정적 사이트 생성
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

console.log('🚀 Environment: ', isVercel ? 'Vercel' : isGitHubPages ? 'GitHub Pages' : 'Development');
console.log('🚀 Final Config basePath:', nextConfig.basePath || '(none)');
console.log('🚀 Final Config output:', nextConfig.output || '(none)');

export default nextConfig;
