<script lang="ts">
	export let display: 'block' | 'inline' | 'wide' = 'block';

	export let text: string = '';
	export let placeholder: string = '';

	export let min = 0;
	export let max = 0;

	export let disabled = false;

	export let value: string | number = '';
	export let checked = false;

	export let type: 'text' | 'number' | 'select' | 'checkbox';
	export let id: string;
</script>

{#if display === 'inline'}
	<div class="input inline">
		<p>
			<slot name="before" />
			{#if type === 'text'}
				<input type="text" {id} bind:value {placeholder} />
			{:else if type === 'number'}
				<input type="number" {id} bind:value {placeholder} {min} {max} />
			{:else if type === 'select'}
				<select {id} {disabled} bind:value>
					<slot />
				</select>
			{:else if type === 'checkbox'}
				<input type="checkbox" role="switch" {id} {disabled} bind:checked />
			{/if}
			<slot name="after" />
		</p>
	</div>
{:else}
	<div class="input" class:block={display === 'block'} class:wide={display === 'wide'}>
		<label for={id}>{text}</label>

		{#if type === 'text'}
			<input type="text" {id} bind:value {placeholder} />
		{:else if type === 'number'}
			<input type="number" {id} bind:value {placeholder} {min} {max} />
		{:else if type === 'select'}
			<select {id} {disabled} bind:value>
				<slot />
			</select>
		{:else if type === 'checkbox'}
			<input type="checkbox" role="switch" {id} {disabled} bind:checked />
		{/if}
	</div>
{/if}

<style>
	.input {
		display: flex;
		align-items: baseline;
	}

	.block label {
		min-width: 8rem;
	}

	.wide label {
		padding-right: 1rem;
	}

	.inline input,
	.inline select {
		width: auto;
		margin: 0 0.25rem;
	}

	.wide input,
	.wide select {
		flex: 1;
	}
</style>
