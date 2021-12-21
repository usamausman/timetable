<script lang="ts">
	import { formatDistance } from 'date-fns';

	import { info, options } from '@helper/stores';
	import { BUILD_DATE } from '@helper/info';
	import Input from '@comp/Input.svelte';

	import { state, refreshSaved, downloadSaved } from '@helper/timetable';

	import { resetAll } from '@helper/stores';
	import Button from '@comp/Button.svelte';
</script>

<section class="options" on:click|stopPropagation={() => {}}>
	<h2>Options</h2>
	<Input
		text="Start Time"
		id="start"
		type="number"
		min={0}
		max={$options.end}
		bind:value={$options.start}
	/>
	<Input
		text="End Time"
		id="end"
		type="number"
		min={$options.start}
		max={24}
		bind:value={$options.end}
	/>
	<Input text="Auto-refresh" id="refreshAfter" type="select" bind:value={$options.refreshAfter}>
		<option value={-1}>Never</option>
		<option value={0}>Always</option>
		<option value={1}>After 1 day</option>
		<option value={7}>After 7 days</option>
	</Input>
	<Input
		text="Notifications"
		id="notifications"
		type="checkbox"
		bind:checked={$options.notifications}
		disabled={!('Notification' in window) || window.Notification.permission === 'denied'}
	/>
	{#if !('Notification' in window)}
		<p style="color: var(--now);">Notifications are not supported by this browser.</p>
	{/if}
	{#if window.Notification.permission === 'denied'}
		<p style="color: var(--now);">Permission for notifications was denied.</p>
	{/if}
	<fieldset
		class="push"
		disabled={!$options.notifications ||
			!('Notification' in window) ||
			window.Notification.permission === 'denied'}
	>
		<Input
			display="inline"
			id="minutesBefore"
			type="number"
			min={0}
			max={60}
			value={$options.notificationsMinutesBefore}
		>
			<p slot="before">Notify me</p>
			<p slot="after">minutes before a class</p>
		</Input>
	</fieldset>

	<details>
		<summary>
			<span>Debug Info</span>
		</summary>

		<div class="debug" style="margin-top: 0.5rem;">
			<p>
				Built {formatDistance(new Date(BUILD_DATE), new Date(), {
					addSuffix: true
				})} ({BUILD_DATE})
			</p>
			<code style="white-space: pre;">
				{JSON.stringify($info, null, 2)}
			</code>
		</div>
	</details>

	<div class="buttons">
		<Button wide on:click={refreshSaved} disabled={$state.fetching}>
			{$state.fetching ? 'Refreshing Timetable...' : 'Refresh Timetable'}
		</Button>
		<Button wide on:click={downloadSaved}>Download Timetable</Button>
	</div>
	<div class="buttons">
		<Button danger wide on:click={resetAll}>Reset All</Button>
	</div>
</section>

<style>
	.options {
		background: var(--bg);
		border-radius: 0.5rem;
		margin: 1rem;
		padding: 1rem;
		max-width: 24rem;
		width: 100%;
	}

	.options h2 {
		margin-top: 0;
	}

	.options > :global(* + *) {
		margin-top: 0.5rem;
	}

	.options .buttons {
		display: flex;
	}

	fieldset {
		margin: 0;
		margin-top: 0.5rem;
		padding: 0;
		border: none;

		transition: opacity 0.25s ease;
	}

	fieldset[disabled] {
		opacity: 0.5;
	}

	summary {
		cursor: pointer;
	}

	.push {
		margin-left: 1.5rem;
	}

	.debug {
		border: solid 0.125rem var(--text);
		border-radius: 0.25rem;
		padding: 0.25rem;
	}
</style>
