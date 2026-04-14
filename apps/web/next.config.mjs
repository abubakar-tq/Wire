/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  transpilePackages: ["@wirefluid/contracts"]
};

export default nextConfig;
