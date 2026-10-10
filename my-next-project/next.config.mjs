/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '127.0.0.1' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/harun',
        destination: '/developer',
        permanent: false,
      },
      {
        source: '/harun/admin',
        destination: '/developer/admin',
        permanent: false,
      },
      {
        source: '/harun/login',
        destination: '/developer/login',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const backendBase = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '') 
      : 'http://localhost:5000';
    return [
      {
        source: '/static/uploads/:path*',
        destination: `${backendBase}/static/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
