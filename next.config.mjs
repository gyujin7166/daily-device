import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: './messages/ko.json',
  },
});
const isE2EBuild = process.env.E2E_BUILD === 'true';

const nextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  transpilePackages: ['next-auth'],
  reactStrictMode: true,
  experimental: isE2EBuild
    ? {
        cpus: 2,
        staticGenerationMaxConcurrency: 1,
        staticGenerationRetryCount: 2,
      }
    : undefined,
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'img1.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: 'img1.kakaocdn.net',
      },
      {
        protocol: 'https',
        hostname: 'ssl.pstatic.net',
      },
    ],
    contentSecurityPolicy: "default-src 'self'; img-src 'self' data: https:;",
  },
};

export default withNextIntl(nextConfig);
