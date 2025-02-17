import withBundleAnalyzer from '@next/bundle-analyzer'

export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})({
  experimental: {
    appDir: true,
    webpackMemoryOptimizations: true,
    webpackBuildWorker: true,
    serverSourceMaps: false,
    devIndicators: {
      appIsrStatus: false,
    },
  },
  productionBrowserSourceMaps: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = Object.freeze({ type: 'memory' })
    }
    return config
  },
})
