<script lang="ts">
	import { formatDistance } from 'date-fns';

	import { info, options } from '@helper/stores';
	import { BUILD_DATE } from '@helper/info';
	import Input from '@comp/Input.svelte';

	const fetching = false;

	const refreshTimetable = () => {};
	const downloadTimetable = () => {};
	const resetTimetable = () => {};
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

		<div class="push">
			<div>
				<code>
					Built {formatDistance(new Date(BUILD_DATE), new Date(), {
						addSuffix: true
					})} ({BUILD_DATE})
				</code>
			</div>
			<div>
				<code style="white-space: pre-wrap; overflow: scroll;">
					{JSON.stringify($info, null, 2)}
				</code>
			</div>
		</div>
	</details>

	{#await fetching}
		<!-- empty -->
	{:catch e}
		<p style="color: red;">{e.message}</p>
	{/await}

	<div class="buttons">
		{#await fetching}
			<button disabled>Refreshing Timetable...</button>
		{:then _}
			<button on:click={refreshTimetable}>Refresh Timetable</button>
		{:catch e}
			<button on:click={refreshTimetable}>Refresh Timetable</button>
		{/await}
		<button on:click={downloadTimetable}>Download Timetable</button>
	</div>
	<div class="buttons">
		<button style="color:green; background: blue;" on:click={resetTimetable}>Reset Timetable</button
		>
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
		justify-content: flex-end;
	}

	.options .buttons button {
		width: 100%;
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

	.push {
		margin-left: 2rem;
	}
</style>
