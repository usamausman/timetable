import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
import svg from '@poppanator/sveltekit-svg';
import path from 'path';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),

	kit: {
		target: 'body',
		vite: {
			plugins: [svg({
				svgoOptions: {
					plugins: [
						{
							name: "cleanupIDs",
							params: {
								remove: false
							}
						}
					]
				}
			})],
			resolve: {
				alias: {
					"@svg": path.resolve('./src/svg'),
					"@comp": path.resolve('./src/components'),
					"@helper": path.resolve('./src/helpers')
				}
			}
		},
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/timetable-dev' : ''
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build'
		}),
	}
};

export default config;
