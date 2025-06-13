/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Only ignore ESLint during development
    ignoreDuringBuilds: process.env.NODE_ENV === "development",
  },
  typescript: {
    // Only ignore TypeScript errors during development
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig