// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === "development",
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: "https://ajxvbgihfkoirmrhyiqf.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeHZiZ2loZmtvaXJtcmh5aXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4MDg3NTUsImV4cCI6MjA2NTM4NDc1NX0.JZXT9y9BpWAqsiG6lVGfO-AfXuogS_nLxUfpU64FKrY",
  }
}

export default nextConfig