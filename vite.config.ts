import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    {
      name: 'ignore-well-known-requests',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Ignore Chrome DevTools and other .well-known requests
          if (req.url?.startsWith('/.well-known/')) {
            res.statusCode = 404;
            res.end();
            return;
          }
          next();
        });
      },
    },
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
});
