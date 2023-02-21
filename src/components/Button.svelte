<script lang="ts">
	export let disabled = false;
	export let danger = false;
	export let wide = false;
	export let icon = false;
	export let round = false;
</script>

<button on:click {disabled} class:wide class:round class:icon class:danger>
	<slot />
</button>

<style>
	button {
		text-transform: uppercase;
		padding: 0.5rem 0.8rem;
		font-size: 0.8rem;
		font-weight: 700;
		border: none;
	}

	button:disabled {
		opacity: 0.5;
	}

	button:not(:disabled):active {
		opacity: 0.75;
	}

	.wide {
		flex: 1;
	}

	.round {
		background: var(--bg);
		border-radius: 100%;
	}

	.icon {
		background: none;
		color: var(--text);
		font-size: 1rem;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;

		padding: 0;
	}

	.icon :global(svg) {
		width: 100%;
	}

	.icon:not(:disabled):active {
		box-shadow: inset 0 0 0 0.125rem var(--text);
		opacity: 0.75;
	}

	.danger {
		background: var(--danger);
		color: var(--danger-text);
	}
</style>
