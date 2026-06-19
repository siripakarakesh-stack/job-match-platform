/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    strictNullChecks: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
};

module.exports = nextConfig;
