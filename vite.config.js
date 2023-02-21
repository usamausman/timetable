import path from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import svg from '@poppanator/sveltekit-svg';

export default defineConfig({
	plugins: [
		sveltekit(),
		svg({
			svgoOptions: {
				plugins: [
					{
						name: 'cleanupIDs',
						params: {
							remove: false
						}
					}
				]
			}
		})
	],
	resolve: {
		alias: {
			'@svg': path.resolve('./src/svg'),
			'@comp': path.resolve('./src/components'),
			'@helper': path.resolve('./src/helpers')
		}
	}
});
