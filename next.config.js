/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/seedguard-main',
  assetPrefix: '/seedguard-main/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
env: {
  NEXT_PUBLIC_SUPABASE_URL: "https://poscnrdrguhiqrkslcmv.supabase.co/rest/v1/",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvc2NucmRyZ3VoaXFya3NsY212Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjM5NDYsImV4cCI6MjA5NDYzOTk0Nn0.G3rYWbqBruHG7SAayOiDEXM3Ul5PP2aGzMq16fcEqfo",
},
};

module.exports = nextConfig;
