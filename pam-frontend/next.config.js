/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
      {
        source: '/blog',
        destination: '/blog/index.html',
      },
      {
        source: '/blog/:post',
        destination: '/blog/:post.html',
      },
    ]
  },
  skipMiddlewareUrlNormalize: true,
}

module.exports = nextConfig
