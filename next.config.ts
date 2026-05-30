import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/CokkingMemo",
  images: { unoptimized: true },
};

export default nextConfig;
