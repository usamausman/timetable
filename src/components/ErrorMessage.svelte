<p class="error">
	<slot />
</p>

<style>
	.error {
		display: inline-block;
		padding: 0.25rem;
		border-radius: 0.25rem;

		background: var(--danger-text);
		color: var(--danger);
	}
</style>
