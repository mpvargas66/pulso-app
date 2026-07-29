/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['pg', 'bcryptjs'],
    isrMemoryCacheSize: 0,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
  output: 'standalone',
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },
};

module.exports = nextConfig;
