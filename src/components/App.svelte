<script lang="ts">
	import { browser } from '$app/environment';
	import { differenceInDays } from 'date-fns';
	import { onMount } from 'svelte';

	import { notify } from '@helper/classes';
	import { date,info,nextClass,options } from '@helper/stores';

	import { refreshSaved } from '@helper/timetable';

	import Form from '@comp/Form.svelte';
	import Grid from '@comp/Grid.svelte';
	import Modal from '@comp/Modal.svelte';

	let vh;
	let scrolled;

	const resize = () => {
		vh = window.innerHeight / 100;
	};

	const scroll = () => {
		scrolled = window.scrollY > 0;
	};

	const refreshIfNeeded = () => {
		if (
			$info.year &&
			$info.identifier &&
			$options.refreshAfter >= 0 &&
			differenceInDays($date, $info.lastFetched) >= $options.refreshAfter
		) {
			refreshSaved();
		}
	};

	onMount(resize);
	onMount(refreshIfNeeded);

	$: browser && document.documentElement.classList.toggle('dark', $options.dark);
	$: $options.notifications && $nextClass.map(notify);
</script>

<svelte:window on:resize|passive={resize} on:scroll|passive={scroll} />

<svelte:head>
	<meta name="theme-color" content={$options.dark ? '#222' : '#fff'} />
</svelte:head>

<main style="--vh: {vh}px;">
	{#if !$info.identifier}
		<Form />
	{:else}
		<Grid {scrolled} />
	{/if}
	<Modal />
</main>

<style>
	main {
		min-height: 100vh;
		min-height: calc(100 * var(--vh, 1vh));
	}
</style>
