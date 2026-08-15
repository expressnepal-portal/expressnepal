/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "expressnepal.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "cms.expressnepal.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cms.expressnepal.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "cms.expressnepal.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cms.expressnepal.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.expressnepal.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.onlinekhabar.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets-cdn-api.ekantipur.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets-cdn.ekantipur.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
