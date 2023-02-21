import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),

	kit: {
		paths: {
			base: '/timetable'
		},
		adapter: adapter({
			pages: 'build',
			assets: 'build'
		})
	}
};

export default config;
