import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build'
		}),
		target: '#svelte',
		vite: {
			resolve: {
				alias: {
					$comp: path.resolve('./src/components'),
					$helper: path.resolve('./src/helpers')
				}
			}
		}
	}
};

export default config;
