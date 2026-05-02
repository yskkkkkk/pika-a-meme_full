/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
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
}

module.exports = nextConfig
