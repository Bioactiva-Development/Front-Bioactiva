import type { NextConfig } from "next";

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' data: https://fonts.gstatic.com;
    img-src 'self' data: blob: https:;
    connect-src 'self' https: http://localhost:* ws://localhost:*;
    frame-src 'self' https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
`

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1", "localhost", "172.27.240.1", "10.107.136.218"],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
