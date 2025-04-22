/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      nodeMiddleware: true,
    },
    middleware: {
      runtime: "nodejs"
    }
  }
  
  module.exports = nextConfig