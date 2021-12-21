<script context="module" lang="ts">
	import { writable } from 'svelte/store';

	const empty = { show: false, component: null, props: {} };

	const modal = writable(empty);

	export const open = (component, props) =>
		modal.set({
			show: true,
			component,
			props
		});
	export const close = () => modal.set(empty);
</script>

<script lang="ts">
	import { fade, scale } from 'svelte/transition';
</script>

{#if $modal.show}
	<section class="bg" transition:fade={{ duration: 250 }} on:click|self={close}>
		<div class="modal" transition:scale={{ duration: 250, start: 1.05 }} on:click|self={close}>
			<svelte:component this={$modal.component} {...$modal.props} />
		</div>
	</section>
{/if}

<style>
	.bg {
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		height: 100%;
		z-index: 10;
		background: rgba(0, 0, 0, 0.3);
	}

	.modal {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}
</style>
