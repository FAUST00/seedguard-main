/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed: output: 'export' and basePath (were for GitHub Pages)
  // Now deploying as a full Next.js app on Vercel
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
