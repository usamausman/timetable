<script lang="ts">
	import ErrorMessage from './ErrorMessage.svelte';

	import Input from '@comp/Input.svelte';

	import { Action, doURL, state } from '@helper/timetable';

	import { resetAll } from '@helper/stores';
	import Button from '@comp/Button.svelte';

	let url: string;

	const get = () => doURL(Action.GET, url);
	const download = () => doURL(Action.DOWNLOAD, url);
</script>

<div class="form">
	<h1>University of Leeds Timetable</h1>
	<span class="danger">
		This app will not work anymore, you can
		<a href="https://mytimetable.leeds.ac.uk">use MyTimetable instead</a>.
	</span>
	<p>
		This app will keep a copy of your timetable so that you can see it even if you are offline! You
		can also see the location of classes, with a link to find them on campus.
	</p>
	<p>If you prefer, you can also download the timetable to use in your own calendar app.</p>
	<h2>Steps</h2>
	<ol>
		<li>
			Sign in to
			<a target="_blank" rel="noopener noreferrer" href="https://studentservices.leeds.ac.uk/"
				>Student Services</a
			>
		</li>
		<li>
			Go to <a
				target="_blank"
				rel="noopener noreferrer"
				href="https://studentservices.leeds.ac.uk/pls/banprod/timetable_uol"
				>Modules/Timetable &gt; View timetable</a
			>
		</li>
		<li>Click any 'Submit' button</li>
		<li>Copy the URL of the timetable into the box below</li>
		<li>Click 'Get Timetable' or 'Download Timetable'</li>
	</ol>
	<Input
		display="wide"
		text="URL:"
		id="url"
		type="text"
		bind:value={url}
		placeholder="timetable.leeds.ac.uk/teaching/..."
	/>
	{#if $state.error}
		<ErrorMessage>{$state.message}</ErrorMessage>
	{/if}
	<div class="buttons">
		<Button on:click={get} disabled={$state.fetching}>
			{$state.fetching ? 'Getting Timetable...' : 'Get Timetable'}
		</Button>
		<Button on:click={download} disabled={$state.downloading}>
			{$state.downloading ? 'Downloading Timetable...' : 'Download Timetable'}
		</Button>
		<Button danger on:click={resetAll}>Reset All</Button>
	</div>
</div>

<style>
	div.form {
		height: 100%;
		max-width: 50rem;
		margin: 0 auto;
		padding: 1rem;
	}

	.form > :global(* + *),
	ol > :global(* + *) {
		margin-top: 0.5rem;
	}

	.buttons {
		display: flex;
		justify-content: center;
		flex-direction: column;
		flex-wrap: wrap;
	}

	.buttons > :global(* + *) {
		margin-top: 0.5rem;
		margin-left: 0;
	}

	@media (min-width: 30rem) {
		.buttons {
			flex-direction: row;
		}

		.buttons > :global(* + *) {
			margin-top: 0;
			margin-left: 0.5rem;
		}
	}

	.danger {
		padding: 0.25rem;
		border-radius: 0.25rem;
		background: var(--danger);
		color: var(--danger-text);
	}
</style>
