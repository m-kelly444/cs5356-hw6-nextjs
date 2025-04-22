/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      nodeMiddleware: true,
    },
    // Vercel-specific settings
    transpilePackages: ["better-auth"]
  }
  
  module.exports = nextConfig