/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MINDEE_API_KEY: process.env.MINDEE_API_KEY,
  },
}

module.exports = nextConfig