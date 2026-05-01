import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Remove header X-Powered-By: Next.js — não precisa anunciar o stack
  poweredByHeader: false,

  // strict mode detecta efeitos colaterais duplos em dev (boa prática)
  reactStrictMode: true,

  // Permite <img> apontando para o Cloudinary sem next/image
  // (evita consumir Image Optimizations do plano Hobby da Vercel — ver CLAUDE.md)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Impede MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Impede que o site seja embutido em iframe
          { key: 'X-Frame-Options', value: 'DENY' },
          // Limita informações no Referer para requisições cross-origin
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Desabilita features do browser que não usamos
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
