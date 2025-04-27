// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'space-star-aws-bucket.s3.eu-north-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
