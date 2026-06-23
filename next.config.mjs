/** @type {import('next').NextConfig} */
const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    'https://app.sandbox.midtrans.com',
    'https://app.midtrans.com',
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'frame-src': [
    "'self'",
    'https://app.sandbox.midtrans.com',
    'https://app.midtrans.com',
  ],
  'img-src': ["'self'", 'data:', 'blob:'],
  'connect-src': ["'self'"],
  'font-src': ["'self'", 'data:'],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
}

const cspString = Object.entries(cspDirectives)
  .map(([key, values]) => `${key} ${values.join(' ')}`)
  .join('; ')

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspString,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ]
  },
}

export default nextConfig
