import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/cokkingmemo",
  images: { unoptimized: true },
};

export default nextConfig;
