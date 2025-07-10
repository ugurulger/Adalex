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
  env: {
    FLASK_API_URL: process.env.FLASK_API_URL || 'http://localhost:5001',
  },
}

export default nextConfig
