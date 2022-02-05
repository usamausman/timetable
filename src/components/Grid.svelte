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

	import Mode from '@svg/mode.svg';
	import Settings from '@svg/settings.svg';
	import TwoTriangles from '@svg/two_triangles.svg';
	import Triangle from '@svg/triangle.svg';

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
			<div on:click={() => ($options.dark = !$options.dark)}>
				<Mode id="mode" />
			</div>
			<div on:click={() => open(Options, {})}>
				<Settings />
			</div>
		</div>
		<nav>
			<Button icon on:click={() => go(-7)}>
				<TwoTriangles />
			</Button>
			<Button icon on:click={() => go(-1)}>
				<Triangle />
			</Button>
			<Button on:click={() => (offset = 0)}>
				{count === 7 ? 'this week' : 'today'}
			</Button>
			<Button icon on:click={() => go(1)}>
				<div style="display: flex; transform: scaleX(-1);">
					<Triangle />
				</div>
			</Button>
			<Button icon on:click={() => go(7)}>
				<div style="display: flex; transform: scaleX(-1);">
					<TwoTriangles />
				</div>
			</Button>
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
		flex-direction: column;
		align-items: center;
	}

	div.options * + * {
		margin-top: 0.5rem;
	}

	div.options div {
		width: 1.5rem;
	}

	div.options :global(svg) {
		cursor: pointer;
	}

	div.options path {
		fill: currentColor;
	}

	/* MODE ICON */

	:global(#mode),
	:global(#mode path) {
		transition: all 0.25s ease;
	}
	:global(#mode path) {
		color: var(--text);
		opacity: 1;
	}

	:global(#mode #inner) {
		opacity: 0;
	}

	:global(.dark #mode) {
		transform: rotate(180deg);
	}

	:global(.dark #mode path) {
		color: var(--bg);
		opacity: 0;
	}

	:global(.dark #mode #inner) {
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
