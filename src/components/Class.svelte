<script context="module" lang="ts">
	import type { ClassInfo } from 'src/global';
	import { add } from 'date-fns';

	import { options } from '@helper/stores';
	import { r, showTime } from '@helper/util';
	import { getTitle, getMethod } from '@helper/classes';

	import { hourSegments } from '@comp/Grid.svelte';

	const colours = {};
</script>

<script lang="ts">
	import AlternativeTime from '@svg/alternative_time.svg';
	import Link from '@svg/link.svg';
	import Location from '@svg/location.svg';
	import Note from '@svg/note.svg';
	import Person from '@svg/person.svg';
	import Time from '@svg/time.svg';
	import Type from '@svg/type.svg';

	export let info = {} as ClassInfo;
	export let full = false;
	export let tzOffset = { hours: 0, minutes: 0 };

	const interval = 60 / hourSegments;

	const getColour = (modules) => {
		const tag = modules.map((m) => m.text).join(',');
		if (!colours[tag]) {
			colours[tag] = `rgb(${r(160, 220)}, ${r(160, 220)}, ${r(160, 220)})`;
		}
		return colours[tag];
	};

	$: row = (time) =>
		(time.getHours() - $options.start - tzOffset.hours) * hourSegments +
		(time.getMinutes() - tzOffset.minutes) / interval +
		1;
</script>

<div
	class="class"
	class:full
	style="grid-row: {row(info.time)} / span {info.duration / interval}; background: {getColour(
		info.modules
	)}"
	on:click
>
	<div class="top">
		<p class="modules hide">
			{#if !full}
				{#each info.modules as mod, i}
					<span>{mod.text}</span>{#if i !== info.modules.length - 1}
						<span>, </span>
					{/if}
				{/each}
			{:else}
				{#each info.modules as mod, i}
					{#if mod.link}
						<a target="_blank" rel="noopener noreferrer" href={mod.link}>{mod.text}</a
						>{#if i !== info.modules.length - 1}
							<span>, </span>
						{/if}
					{:else}
						<span>{mod.text}</span>{#if i !== info.modules.length - 1}
							<span>, </span>
						{/if}
					{/if}
				{/each}
			{/if}
		</p>
		{#if !full && info.alternativeTimes}
			<div class="icon">
				<AlternativeTime />
			</div>
		{/if}
	</div>
	{#if info.moduleTitles.length > 0}
		<p class="hide titles bold">{info.moduleTitles.join(', ')}</p>
	{:else}
		<p class="hide titles bold none">[no title]</p>
	{/if}
	<p class="hide">{getTitle(info)}</p>
	{#if info.method}
		<!-- <div class="icon"> -->
		<!-- <Type /> -->
		<p>{getMethod(info.method)}</p>
		<!-- </div> -->
	{/if}
	{#if full}
		<div class="icon">
			<Time />
			<p>
				{showTime(info.time)}
				to
				{showTime(add(info.time, { minutes: info.duration }))}
			</p>
		</div>
	{/if}
	{#if info.location.text}
		<div class="icon">
			<Location />
			{#if info.location.link}
				<a target="_blank" rel="noopener noreferrer" href={info.location.link}>
					{info.location.text}
				</a>
			{:else}
				<p>{info.location.text}</p>
			{/if}
		</div>
	{/if}
	{#if full}
		{#if info.teachers.length > 0}
			<div class="icon">
				<Person />
				<p>
					{#each info.teachers as teacher, i}
						<span>{teacher}</span>{#if i !== info.teachers.length - 1}
							<span>, </span>
						{/if}
					{/each}
				</p>
			</div>
		{/if}
		{#if info.notes}
			<div class="icon">
				<Note />
				<div>
					{#each info.notes as note}
						<p>{note}</p>
					{/each}
				</div>
			</div>
		{/if}
		{#if info.link}
			<div class="icon">
				<Link />
				<div>
					{#each info.link as l}
						<a target="_blank" rel="noopener noreferrer" style="display: block;" href={l.link}>
							{l.text}
						</a>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
	{#if full && info.alternativeTimes}
		<div class="icon">
			<AlternativeTime />
			<a target="_blank" rel="noopener noreferrer" href={info.alternativeTimes.link}>
				Alternative times
			</a>
		</div>
	{/if}
</div>

<style>
	.class {
		background: var(--class);
		margin: 0.125rem;
		padding: 0.5rem;
		border-radius: 0.25rem;
		min-width: 0;
		max-width: 100%;
		font-size: 0.8rem;
		border-left: solid 0.25rem rgba(0, 0, 0, 0.15);

		cursor: pointer;
	}

	:global(.dark) .class {
		background: var(--class) !important;
	}

	.class.full {
		font-size: 1rem;
		cursor: initial;
	}

	.hide {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.class.full .hide {
		white-space: normal;
	}

	.class > * + * {
		margin-top: 0.25rem;
	}

	.bold {
		font-weight: bold;
	}

	.icon {
		display: flex;
	}

	.icon :global(svg) {
		display: inline-block;
		width: 1em;
		height: 1.1em;
		flex-shrink: 0;
	}

	.icon > :global(svg + *) {
		margin-left: 0.25em;
		display: inline;
	}

	.top {
		display: flex;
		justify-content: space-between;
	}

	.class.full {
		flex: 0 1 24rem;
	}

	.none {
		opacity: 0.5;
	}

	.class.full .titles {
		font-size: 1.2rem;
	}
</style>
