// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
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
