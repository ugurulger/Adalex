/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Performance optimizations for faster development
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Faster compilation
  compiler: {
    removeConsole: false, // Keep console logs in development
  },
  env: {
    FLASK_API_URL: process.env.FLASK_API_URL || 'http://localhost:5001',
  },
}

export default nextConfig
