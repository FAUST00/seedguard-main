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
  NEXT_PUBLIC_SUPABASE_URL: "https://earfjshpbwcnpqjnrnvl.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "YOUR_ANON_KEY_HERE",   // ← Get this from Supabase
  NEXT_PUBLIC_SEEDGUARD_API_URL: "https://seedguard-api.onrender.com",
},
};

module.exports = nextConfig;
