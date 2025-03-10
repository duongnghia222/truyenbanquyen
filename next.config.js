/** @type {import('next').NextConfig} */

// Log environment variables when Next.js config is loaded
console.log('Loading Next.js config with NODE_ENV:', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'production') {
  console.log('Production environment detected - should be loading from .env.production');
}

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'duongnghia222.s3.ap-southeast-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
    ],
  },
  // External packages that should be bundled with native Node.js require
  serverExternalPackages: ['mongoose'],
  // Add TypeScript configuration to handle TypeScript errors
  typescript: {
    // Dangerously allow production builds to complete even with type errors
    // Only use this if you want to proceed with the build despite errors
    ignoreBuildErrors: true,
  },
  // Webpack configuration to handle problematic modules in Edge Runtime
  webpack: (config, { isServer, nextRuntime }) => {
    // Avoid importing mongoose in Edge Runtime
    if (isServer && nextRuntime === 'edge') {
      config.resolve.alias = {
        ...config.resolve.alias,
        mongoose: false,
      };
    }
    return config;
  },
  // Configure Turbopack to resolve the warning
  experimental: {
    // This indicates we're configuring for Turbopack
    turbo: {},
  },
}

module.exports = nextConfig 