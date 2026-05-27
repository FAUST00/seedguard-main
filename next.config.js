/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/seedgaurd-tracker',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
