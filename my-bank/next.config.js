/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',         // Where to output the service worker
  register: true,         // Register automatically
  skipWaiting: true,      // Update immediately
  disable: process.env.NODE_ENV === 'development', // Disable in dev mode to avoid caching issues
});

const nextConfig = {
  // Your existing config here (if any)
};

module.exports = withPWA(nextConfig);