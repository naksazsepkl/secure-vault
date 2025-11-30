/** @type {import('next').NextConfig} */
const getBasePath = () => {
  if (process.env.NEXT_BASE_PATH !== undefined) {
    // Empty string means root path (for username.github.io)
    if (process.env.NEXT_BASE_PATH === '') {
      return undefined;
    }
    // Non-empty string should start with /
    if (process.env.NEXT_BASE_PATH.startsWith('/')) {
      return process.env.NEXT_BASE_PATH;
    }
  }
  return undefined;
};

const computedBasePath = getBasePath();

const nextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
  },
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: computedBasePath,
  assetPrefix: computedBasePath,
};

export default nextConfig;
