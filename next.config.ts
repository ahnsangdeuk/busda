import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_DAEGU_API_KEY: "Poc6rnzr84pjw40%2B%2FXOt70%2BNL37qgNMjsHeh1V%2FxVwVU3ioy%2FBeGDnz1TOjcbwCDnnGPT4Sbn%2FGVsshKDZ8F0Q%3D%3D",
  },
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: '/busda',
  assetPrefix: '/busda',
};

export default nextConfig;
