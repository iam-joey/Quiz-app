/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // async headers() {
  //   return [
  //     {
  //       source: "/:path*",
  //       headers: [
  //         {
  //           key: "Content-Security-Policy",
  //           value:
  //             "default-src 'self'; frame-src 'self' https://docs.google.com;",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
