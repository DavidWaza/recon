import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "media.themoviedb.org",
        pathname: "/t/p/**",
      },
        {
        protocol: "https",
        hostname: "people.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "th.bing.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.imdb.com",
        pathname: "/**",
      },
     
     
      {
        protocol: "https",
        hostname: "www.netflix.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.res.cloudinary.com",
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
