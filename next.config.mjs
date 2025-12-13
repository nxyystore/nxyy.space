import JavaScriptObfuscator from 'webpack-obfuscator';
import TerserPlugin from 'terser-webpack-plugin';

const DISCORD_EPOCH = 1420070400000n;
const buildId = ((BigInt(Date.now()) - DISCORD_EPOCH) << 22n).toString();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  generateBuildId: () => buildId,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  productionBrowserSourceMaps: false,

  compress: true,

  webpack: (config, { dev, isServer, webpack }) => {
    if (!dev && !isServer) {
      config.optimization.minimizer = [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: false,
              drop_debugger: false,
              passes: 2,
            },
            mangle: {
              properties: false,
              reserved: ['React', 'ReactDOM', '__next', '_next', 'module', 'exports']
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        }),
      ];

      config.plugins.push(
        new JavaScriptObfuscator({
          compact: true,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          debugProtection: false,
          disableConsoleOutput: false,
          identifierNamesGenerator: 'hexadecimal',
          log: false,
          numbersToExpressions: false,
          renameGlobals: false,
          selfDefending: false,
          simplify: true,
          splitStrings: false,
          stringArray: true,
          stringArrayCallsTransform: false,
          stringArrayEncoding: [],
          stringArrayIndexShift: false,
          stringArrayRotate: false,
          stringArrayShuffle: false,
          stringArrayThreshold: 0.3,
          transformObjectKeys: false,
          unicodeEscapeSequence: false,
          reservedNames: [
            '^React',
            '^_react',
            '^__next',
            '^_next',
            '^__webpack',
            '^webpackJsonp',
            '^module',
            '^exports',
            '^require',
            '^global',
            '^window',
            '^document'
          ]
        }, [
          ''
        ])
      );

      config.optimization.chunkIds = 'deterministic';
      config.optimization.moduleIds = 'deterministic';

      config.output = {
        ...config.output,
        hashFunction: 'sha256',
        hashDigest: 'hex',
        hashDigestLength: 64,
        filename: `static/${buildId}/d/[contenthash].js`,
        chunkFilename: `static/${buildId}/d/[contenthash].js`,
        assetModuleFilename: `static/media/${buildId}/[contenthash][ext]`,
      };

      config.optimization.splitChunks = {
        chunks: 'initial',
        minSize: 300000,
        maxInitialRequests: 1,
        maxAsyncRequests: 1,
        cacheGroups: {
          default: false,
          vendors: false
        }
      };
      config.optimization.runtimeChunk = false;

      if (config.module && config.module.rules) {
        config.module.rules.forEach(rule => {
          if (rule.test && rule.test.toString().includes('css')) {
            if (rule.use && Array.isArray(rule.use)) {
              rule.use.forEach(use => {
                if (use.loader && use.loader.includes('css-loader') && use.options) {
                  use.options.modules = {
                    ...use.options.modules,
                    localIdentName: dev ? '[local]' : '[hash:base64:8]'
                  };
                }
              });
            }
          }
        });
      }
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      'fs': false,
      'path': false,
      'os': false,
    };

    return config;
  },

  experimental: {
    swcMinify: true,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
