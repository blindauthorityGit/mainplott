/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ["cdn.sanity.io", "cdn.shopify.com", "firebasestorage.googleapis.com"],
    },
};

export default nextConfig;
