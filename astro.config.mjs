import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ortner-christine.at',
  output: 'static',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto'
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp'
    }
  }
});
