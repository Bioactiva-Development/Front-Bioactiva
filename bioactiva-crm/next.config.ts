import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  allowedDevOrigins: ["127.0.0.1", "localhost", "172.27.240.1", "10.107.136.218"],
};

export default nextConfig;
