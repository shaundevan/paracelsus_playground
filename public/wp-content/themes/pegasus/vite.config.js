import path from 'path';
import { defineConfig } from 'vite';
import globImporter from 'node-sass-glob-importer';
import { pegasusBlockImporter } from './.vite/plugins/pegasus-block-importer.js';

const ROOT = path.resolve('../../../');
const BASE = __dirname.replace(ROOT, '');


export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `${BASE}/dist/` : BASE,
  build: {
    minify: 'terser',
    manifest: 'manifest.json',
    assetsDir: '.',
    outDir: `./dist`,
    emptyOutDir: true,
    sourcemap: true,
    terserOptions: {
      mangle: {
        reserved: ['_']
      }
    },
    rollupOptions: {
      input: [
        path.resolve(__dirname, 'assets/scripts/main.js'),
        path.resolve(__dirname, 'assets/styles/main.scss'),
        path.resolve(__dirname, 'assets/styles/editor.scss'),
        path.resolve(__dirname, 'assets/js/tracking/adform-tracking.js'),
      ],
      output: {
        entryFileNames: '[hash].js',
        chunkFileNames: '[hash].js',
        assetFileNames: ({name}) => {

          if(name === 'editor.css') {
            return 'assets/styles/editor.css';
          }

          if (/\.css$/.test(name ?? '')) {
              return 'assets/styles/[hash].[ext]';   
          }

          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')){
            return 'assets/images/[name].[ext]';
          }

          if (/\.(woff2|woff|ttf|otf)$/.test(name ?? '')){
            return 'assets/fonts/[name].[ext]';
          }
 
          return 'assets/[name].[ext]';
        },
      },
      cache: true, // Enable caching
    },
  },
  optimizeDeps: {
    include: ['assets/scripts/**/*.js', 'blocks/scripts/**/*.js', 'vendor/plug-and-play-design/**/*.js'], // Pre-bundle large dependencies
  },
  css: {
    preprocessorOptions: {
      scss: {
        importer: globImporter(),
      }
    }
  },
  plugins: [
    pegasusBlockImporter([
      path.resolve(__dirname, 'blocks'),
      path.resolve(__dirname, 'vendor/plug-and-play-design'),
    ]),
  ],
  resolve: {
    alias: {
      '@PegasusCore': path.resolve(__dirname, 'vendor/plug-and-play-design'),
      '@PegasusTheme': path.resolve(__dirname),
    },
  },
});
