/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for multiple lockfiles issue
  outputFileTracingRoot: __dirname,
  
  images: {
    domains: ['t.me', 'i.postimg.cc', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  webpack: (config) => {
    // Добавляем поддержку шрифтов
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[hash][ext][query]'
      }
    });
    
    return config;
  },
  
  async rewrites() {
    // Don't rewrite API calls in production as they'll go directly to Vercel serverless functions
    if (process.env.NODE_ENV === 'production') {
      return [];
    }
    
    // In development, proxy API calls to the backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;