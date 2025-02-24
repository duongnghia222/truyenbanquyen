/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'duongnghia222.s3.ap-southeast-2.amazonaws.com',
      },
    ],
  },
}

module.exports = nextConfig 