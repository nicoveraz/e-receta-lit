import cpy from 'rollup-plugin-cpy';

import { createDefaultConfig } from '@open-wc/building-rollup';

const config = createDefaultConfig({ input: './index.html' });

export default {
  ...config,
  output: {
    ...config.output,
    sourcemap: false,
  },
  plugins: [...config.plugins, cpy([
      {
        files: ['manifest.json', 'images/**'],
        dest: 'dist',
        options: {
            // parents makes sure to preserve the original folder structure
            parents: true,
          }
       }
    ])],
};