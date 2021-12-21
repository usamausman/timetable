<script context="module" lang="ts">
	export const hourSegments = 4;
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { add, format, isSameDay } from 'date-fns';

	import { date, hour, line, options, timetable, open } from '@helper/stores';
	import { showTime } from '@helper/util';

	import Class from '@comp/Class.svelte';
	import Options from '@comp/Options.svelte';
	import Button from '@comp/Button.svelte';

	export let scrolled: boolean;

	let offset = 0;
	let count = 0;
	let shouldAlign = false;

	const go = (n) => (offset += n);

	const getTimes = (base, offset, currentHour, from, to) => {
		const day = add(base, { days: offset });
		return [...Array(to - from)].map((_, i) => {
			const hour = from + i;
			return {
				time: showTime(add(day, { hours: hour })),
				now: currentHour === hour
			};
		});
	};

	const getDays = (base, offset, count, timetable) => {
		const baseDate = new Date(base);

		return [...Array(count)].map((_, i) => {
			const day = add(baseDate, { days: offset + i });

			const classes = timetable.filter((_class) => isSameDay(_class.time, day));

			return {
				day,
				date: {
					day: format(day, 'EEEE'),
					date: format(day, day.getFullYear() === baseDate.getFullYear() ? 'd MMM' : 'd MMM yyyy')
				},
				classes,
				today: offset + i === 0,
				weekend: day.getDay() === 0 || day.getDay() === 6
			};
		});
	};

	/* WINDOW FUNCTIONS */

	const resize = () => {
		let temp = Math.floor(document.body.offsetWidth / 160);
		temp = Math.max(2, Math.min(temp, 7));
		count = temp;
		shouldAlign = count === 7;
	};

	onMount(resize);

	$: alignToWeek = shouldAlign ? -((new Date($date).getDay() + 6) % 7) : 0;
	$: times = getTimes($date, offset + alignToWeek, $hour, $options.start, $options.end);
	$: days = getDays($date, offset + alignToWeek, count, $timetable);
</script>

<svelte:window on:resize={resize} />

<section
	class="grid"
	style="--start: {$options.start}; --end: {$options.end}; --segments: {hourSegments};"
>
	<div class="top" class:shadow={scrolled}>
		<div class="options">
			<div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 100 100"
					on:click={() => open(Options, {})}
					><path
						d="M58.8 100H42a2 2 0 01-2-1.6l-2.7-13.8a36.9 36.9 0 01-10.2-5.8l-13.5 4.5a2 2 0 01-.6.1 2 2 0 01-1.7-1L2.9 68a2 2 0 01.4-2.5L14 56.1a37.5 37.5 0 01-.5-6.1 37.4 37.4 0 01.4-5.8L3.3 34.9a2 2 0 01-.4-2.5L11.3 18a2 2 0 011.7-1 2 2 0 01.6.1l13.2 4.5a36.9 36.9 0 0110.5-6.1l2.8-13.8A2 2 0 0142 0h16.6a2 2 0 012 1.6l2.8 13.8a36.9 36.9 0 0110.5 6L87 17a2 2 0 01.7 0 2 2 0 011.7 1L98 32.3a2 2 0 01-.4 2.5l-10.6 9.3a37.5 37.5 0 01.5 5.8 37.4 37.4 0 01-.5 6.1l10.6 9.3a2 2 0 01.4 2.5l-8.4 14.5a2 2 0 01-1.7 1 2 2 0 01-.7-.1l-13.4-4.6a36.9 36.9 0 01-10.2 6l-2.8 13.7a2 2 0 01-2 1.6zm-8.4-69a18.9 18.9 0 00-7.4 1.5 19 19 0 00-6 4 19 19 0 00-4.1 6.1 18.9 18.9 0 00-1.5 7.4 18.9 18.9 0 001.5 7.4 19 19 0 004 6 19 19 0 006 4.1 18.9 18.9 0 007.5 1.5 18.9 18.9 0 007.4-1.5 19 19 0 006-4 19 19 0 004.1-6.1 18.9 18.9 0 001.5-7.4 18.9 18.9 0 00-1.5-7.4 19 19 0 00-4-6 19 19 0 00-6.1-4.1 18.9 18.9 0 00-7.4-1.5z"
					/></svg
				>
			</div>
			<div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					id="mode"
					viewBox="0 0 100 100"
					on:click={() => ($options.dark = !$options.dark)}
				>
					<path
						d="M50 100.2L39.4 89.6l-14.5 3.9L21 79 6.5 75l3.9-14.5L-.2 50l10.6-10.6-3.9-14.5L21 21 25 6.5l14.5 3.9L50-.2l10.6 10.6 14.5-3.9L79 21 93.5 25l-3.9 14.5L100.2 50 89.6 60.6l3.9 14.5L79 79 75 93.5l-14.5-3.9L50 100.2zM50 15a34.8 34.8 0 00-13.6 2.8 34.9 34.9 0 00-11.2 7.5 34.9 34.9 0 00-7.5 11A34.8 34.8 0 0015 50a34.8 34.8 0 002.7 13.6 34.9 34.9 0 007.5 11.2 34.9 34.9 0 0011.2 7.5A34.8 34.8 0 0050 85a34.8 34.8 0 0013.6-2.7 34.9 34.9 0 0011.1-7.5 34.9 34.9 0 007.5-11.2A34.8 34.8 0 0085 50a34.8 34.8 0 00-2.8-13.6 34.9 34.9 0 00-7.5-11.2 34.9 34.9 0 00-11-7.5A34.8 34.8 0 0050 15z"
						id="outer"
					/>
					<path
						d="M50 85a34.8 34.8 0 01-13.6-2.8 34.9 34.9 0 01-11.1-7.5 34.9 34.9 0 01-7.5-11A34.8 34.8 0 0115 50a34.8 34.8 0 012.8-13.6 34.9 34.9 0 017.5-11.1 34.9 34.9 0 0111-7.5A34.8 34.8 0 0150 15a34.8 34.8 0 0113.6 2.7 34.9 34.9 0 0111.1 7.5 34.9 34.9 0 017.5 11.2A34.8 34.8 0 0185 50a34.8 34.8 0 01-2.8 13.6 34.9 34.9 0 01-7.5 11.1 34.9 34.9 0 01-11 7.5A34.8 34.8 0 0150 85zm0-62.5v55a27.3 27.3 0 0010.7-2.2 27.4 27.4 0 008.7-5.9 27.4 27.4 0 006-8.7A27.3 27.3 0 0077.4 50a27.3 27.3 0 00-2.2-10.7 27.4 27.4 0 00-5.9-8.7 27.4 27.4 0 00-8.7-6A27.3 27.3 0 0050 22.6z"
						id="inner"
					/>
					<path
						d="M50 77.5v-55a27.3 27.3 0 0110.7 2.2 27.4 27.4 0 018.7 5.9 27.4 27.4 0 016 8.7A27.3 27.3 0 0177.4 50a27.3 27.3 0 01-2.2 10.7 27.4 27.4 0 01-5.9 8.7 27.4 27.4 0 01-8.7 6A27.3 27.3 0 0150 77.4z"
					/>
				</svg>
			</div>
		</div>
		<nav>
			<Button icon on:click={() => go(-7)}>◀◀</Button>
			<Button icon on:click={() => go(-1)}>◀</Button>
			<Button on:click={() => (offset = 0)}>
				{count === 7 ? 'this week' : 'today'}
			</Button>
			<Button icon on:click={() => go(1)}>▶</Button>
			<Button icon on:click={() => go(7)}>▶▶</Button>
		</nav>
		<div class="days">
			{#each days as { date, today, weekend }}
				<div class:today class:weekend>
					<p class="day">{date.day}</p>
					<p class="date">{date.date}</p>
				</div>
			{/each}
		</div>
	</div>
	<div class="times">
		{#each times as { time, now }, i}
			<!-- hide first time -->
			{#if i > 0}
				<p class:now style="grid-row: time-start {i * hourSegments + 1} / span {hourSegments}">
					<span>{time}</span>
				</p>
			{/if}
		{/each}
	</div>
	<div class="classes">
		{#each days as { day, today, weekend, classes }, i}
			<div class:today class:weekend>
				{#if today && $line >= 0 && $line < 1}
					<div class="line" style="--progress: {$line};" />
					<div class="dot" style="--progress: {$line};" />
				{/if}
				{#each classes as info}
					<Class {info} on:click={() => open(Class, { full: true, info })} />
				{/each}
			</div>
		{/each}
	</div>
</section>

<style>
	/* GRID */

	section.grid {
		--left: 60px;
		--times: calc((var(--end) - var(--start)) * var(--segments));

		min-height: calc(100 * var(--vh, 1vh));

		display: grid;
		grid-template-columns: var(--left) 1fr;
		grid-template-rows: auto 1fr;
	}

	div.top {
		position: sticky;
		top: 0;
		z-index: 2;

		grid-column: 1 / -1;
		display: grid;
		grid-template: auto 1fr / var(--left) 1fr;

		backdrop-filter: blur(2px);

		transition: box-shadow 0.25s ease;
	}

	.shadow {
		box-shadow: 0 0.25rem 0.25rem 0 rgba(0, 0, 0, 0.05);
	}

	/* OPTIONS */

	div.top div.options {
		padding: 0.25rem;
		background: var(--bg-90);

		grid-row: 1 / -1;

		display: flex;
	}

	div.options div {
		width: 100%;
	}

	div.options svg {
		cursor: pointer;
	}

	div.options path {
		fill: currentColor;
	}

	/* MODE ICON */

	div.options svg#mode,
	div.options svg#mode path {
		transition: all 0.25s ease;
	}

	div.options svg#mode #inner {
		opacity: 0;
	}

	div.options svg#mode path {
		color: var(--text);
		opacity: 1;
	}

	.dark div.options svg#mode {
		transform: rotate(180deg);
	}

	.dark div.options svg#mode path {
		color: var(--bg);
		opacity: 0;
	}

	.dark div.options svg#mode #inner {
		color: var(--text);
		opacity: 1;
	}

	/* NAV + DAYS */

	nav {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;

		padding: 0.25rem;
	}

	div.days {
		grid-column: 2;

		display: grid;
		grid-auto-columns: 1fr;
		grid-auto-flow: column;
		text-align: center;
	}

	div.days > div {
		background: var(--bg-90);
		box-shadow: 0 -40px 0 0 var(--bg-90);

		padding: 0.25rem;
	}

	div.days .day {
		font-weight: bold;
	}

	div.days .date {
		font-size: 12px;
	}

	.weekend {
		--bg: var(--weekend);
		--bg-90: var(--weekend-90);
	}

	.today {
		--bg: var(--today);
		--bg-90: var(--today-90);
	}

	/* TIMES */

	div.times,
	div.classes > div {
		display: grid;
		grid-template-rows: repeat(var(--times), [time-start] 1fr);
	}

	div.times {
		text-align: center;
	}

	div.times > p {
		font-size: 0.8rem;
	}

	div.times > p > span {
		display: inline-block;
		padding: 0 0.5rem;
		transform: translateY(-50%);
	}

	div.times > p.now {
		color: var(--now);
	}

	/* CLASSES */

	div.classes {
		display: grid;
		grid-auto-columns: 1fr;
		grid-auto-flow: column;
		position: relative;
	}

	div.classes > div {
		position: relative;
		background: var(--bg);
		box-shadow: 0 -6rem 0 0 var(--bg);
	}

	.line {
		position: absolute;
		top: calc(100% * var(--progress));
		left: 0;
		right: 0;
		height: 1px;
		opacity: 0.5;
		z-index: 1;
		background: red;
		transform: translateY(-50%);
	}

	.dot {
		position: absolute;
		top: calc(100% * var(--progress));
		background: red;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		z-index: 1;
		transform: translate(-50%, -50%);
	}
</style>
