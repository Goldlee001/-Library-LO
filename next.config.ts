/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ⚠️ This allows production builds to complete even if ESLint errors exist
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
