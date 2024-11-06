/** @type {import('next').NextConfig} */
import createNextIntlPlugin from 'next-intl/plugin';
import withAntdLess from 'next-plugin-antd-less'


const CORS_HEADERS = [
  {
    key: 'Access-Control-Allow-Credentials',
    value: 'true',
  },
  {
    key: 'Access-Control-Allow-Origin',
    value: '*',
  },
  {
    key: 'Access-Control-Allow-Methods',
    value: 'GET,DELETE,PATCH,POST,PUT',
  },
  {
    key: 'Access-Control-Allow-Headers',
    value: 'Content-Type, Authorization',
  },
];

const nextConfig = {
  env: {
    JWT_SECRET: 'next-admin',
    BASE_API_URL: '/api',
  },
  async rewrites() {
    return [
      //接口请求 前缀带上/api-text/
      {
        source: '/api/:path*',
        destination: `http://8.130.69.116:8080/:path*`,
      },
    ];
  },
  async headers() {
    // 跨域配置
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      {
        source: '/api/:path*', // 为访问 /api/** 的请求添加 CORS HTTP Headers
        headers: CORS_HEADERS,
      },
      {
        source: '/specific', // 为特定路径的请求添加 CORS HTTP Headers,
        headers: CORS_HEADERS,
      },
    ];
  },
  swcMinify: true,
  // fastRefresh: true,
  // concurrentFeatures: true
};

const withNextIntl = createNextIntlPlugin()(nextConfig);

export default withAntdLess(withNextIntl);
