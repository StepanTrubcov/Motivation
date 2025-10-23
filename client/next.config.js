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
    // In development, proxy API calls to the backend
    if (process.env.NODE_ENV === 'development') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/:path*`,
        },
      ];
    }
    
    // In production, don't rewrite API calls as they'll go directly to Next.js API routes
    return [];
  },
};

module.exports = nextConfig;