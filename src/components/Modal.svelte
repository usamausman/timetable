<script lang="ts">
	import { fade, scale } from 'svelte/transition';
	import { modal, close } from '@helper/stores';
	import Button from '@comp/Button.svelte';

	import X from '@svg/x.svg';
</script>

{#if $modal.component !== null}
	<section class="bg" transition:fade={{ duration: 250 }} on:click|self={close}>
		<div class="modal" transition:scale={{ duration: 250, start: 1.05 }} on:click|self={close}>
			<svelte:component this={$modal.component} {...$modal.props} />
			<div class="close">
				<Button icon on:click={close}>
					<X />
				</Button>
			</div>
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
		position: relative;
		display: flex;
		justify-content: center;
		margin: 0 auto;
		padding: 1rem;
	}

	.close {
		position: absolute;
		top: 0;
		right: 0;

		background: var(--bg);
		border-radius: 100%;
		box-shadow: 0 0 0.25rem 0 rgba(0, 0, 0, 0.25);
	}
</style>
