/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://agrimark-api.onrender.com/api/v1',
  },
  images: { remotePatterns: [{ protocol: 'https', hostname: '**' }] },
};
module.exports = nextConfig;
