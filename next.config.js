/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/seedguard-main',
  trailingSlash: true,
  images: { unoptimized: true },
};
module.exports = nextConfig;
