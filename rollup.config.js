//import { createDefaultConfig } from '@open-wc/building-rollup';

// if you need to support IE11 use "modern-and-legacy-config" instead.
import { createCompatibilityConfig } from '@open-wc/building-rollup';
// export default createCompatibilityConfig({ input: './index.html' });

// export default createDefaultConfig({ input: './index.html' });
import cpy from 'rollup-plugin-cpy';

const config = createCompatibilityConfig({
  input: './index.html',
});
// if you use an array of configs, you don't need the copy task to be executed for both builds.
// we can add the plugin only to the first rollup config:
export default [
  // add plugin to the first config
  {
    ...config[0],
    plugins: [
      ...config[0].plugins,
      cpy([
			{
		    files: ['manifest.json', 'images/**', 'worker-one.js'],
		    dest: 'dist',
		    options: {
		      	// parents makes sure to preserve the original folder structure
		      	parents: true,
		    	}
		   }
		]),
    ],
  },

  // leave the second config untouched
  config[1],
];