import type { NextConfig } from "next";

// La Content-Security-Policy se define en `src/proxy.ts` con un nonce por request
// (CSP estricta sin 'unsafe-inline'/'unsafe-eval'). No declararla aqui para evitar
// enviar dos cabeceras CSP en conflicto.
const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1", "localhost", "172.27.240.1", "10.107.136.218"],
};

export default nextConfig;
