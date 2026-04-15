/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  transpilePackages: ["@wirefluid/contracts"],
  devIndicators: {
    appIsrStatus: true,
    position: 'top-right',
  }
};

export default nextConfig;
