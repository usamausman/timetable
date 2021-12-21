<script lang="ts">
	import Input from '@comp/Input.svelte';

	export let fetching;
	export let getTimetable;
	export let getAndDownloadTimetable;
	export let resetTimetable;

	export let url: string;
</script>

<div class="form">
	<h1>University of Leeds Timetable</h1>
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
	<div class="buttons">
		{#await fetching}
			<button disabled>Getting Timetable...</button>
		{:then _}
			<button on:click={getTimetable}>Get Timetable</button>
		{:catch e}
			<button on:click={getTimetable}>Get Timetable</button>
		{/await}
		<button on:click={getAndDownloadTimetable}>Download Timetable</button>
		<button on:click={resetTimetable}>Reset</button>
	</div>
	{#await fetching}
		<!-- empty -->
	{:catch e}
		<p style="color: red;">{e.message}</p>
	{/await}
</div>

<style>
	div.form {
		height: 100%;
		max-width: 50rem;
		margin: 0 auto;
		padding: 1rem;
	}

	.buttons {
		display: flex;
		justify-content: center;
		margin-top: 0.5rem;
	}

	div.input {
		display: flex;
		align-items: baseline;
		flex-wrap: nowrap;
	}

	.input input {
		flex: 1;
	}
</style>
