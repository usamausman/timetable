<script lang="ts">
	import { onMount } from 'svelte';
	import { add, differenceInDays } from 'date-fns';
	import * as ics  from 'ics';
	const { createEvents } = ics;

	import { date, info, nextClass, options, timetable } from '@helper/stores';
	import { buildURL } from '@helper/util';

	import { refreshSaved } from '@helper/timetable';
	import Form from '@comp/Form.svelte';

	import { browser } from '$app/env';
	import Modal from '@comp/Modal.svelte';

	let fetching;

	let vh;
	let scrolled;
	let url: string;

	const fetchTimetable = async (year, identifier) => {
		const inner = async () => {
			let res;
			try {
				res = await fetch(buildURL(year, identifier));
				$info.lastFetched = new Date();
			} catch {
				throw new Error('Timetable could not be fetched, please check your connection');
			}
			const text = await res.text();
			const parser = new DOMParser();
			const root = parser.parseFromString(text, 'text/html').body;

			// 1-indexed week, which is a Monday
			const startDate = add(
				new Date(Date.parse((root.querySelector('span.header-3-0-22') as HTMLElement).innerText)),
				{ days: -8 }
			);

			const weekdays = Array.from(root.querySelectorAll('table.spreadsheet')).map((e) =>
				Array.from(e.querySelectorAll('tr:not([class])')).map((el) => Array.from(el.children))
			);

			// put Sunday first
			weekdays.unshift(weekdays.pop());

			return weekdays.flatMap((classes, weekday) =>
				classes.flatMap((_class) => parseClass(_class, startDate, weekday, year))
			);
		};

		return (fetching = inner());
	};

	const getTimetable = async () => {
		const params = new URLSearchParams(url);
		const identifier = params.get('identifier');
		const year = url.match(/teaching\/(\d+)\//)[1];

		if (!identifier) {
			throw new Error('Incorrect URL, please follow the steps again');
		}

		try {
			$timetable = await fetchTimetable(year, identifier);
			$info.year = year;
			$info.identifier = identifier;
		} catch (e) {
			console.error(e);
		}
	};

	const downloadTimetable = () => {
		const year = Number($info.year.substr(0, 4));
		const name = `Leeds ${year}-${year + 1}`;

		const all = $timetable.flatMap((c) => toEvent(c, name));

		const { error, value: calendar } = createEvents(all);

		if (!error) {
			const a = document.createElement('a');
			a.href = 'data:text/calendar;charset=utf8,' + escape(calendar);
			a.download = name;
			a.click();
		}
	};

	const refreshTimetable = async () => {
		$timetable = await fetchTimetable($info.year, $info.identifier);
	};

	const resetTimetable = () => {
		close();
		$timetable = [];
		$info.identifier = '';
		$info.year = '';
	};

	const getAndDownloadTimetable = async () => {
		await getTimetable();
		downloadTimetable();
		resetTimetable();
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
	// onMount(register);

	$: browser && document.documentElement.classList.toggle('dark', $options.dark);
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
