<script context="module">
  const colours = {}
</script>

<script>
  import { hourSegments } from './App.svelte'
  import { showTime, getTitle, getMethod } from './util'
  import { options } from './stores'

  export let click = () => {}

  let clickFull = (e) => {
    if (!full) click()
    else e.stopPropagation()
  }

  export let info = {}
  export let full = false

  const interval = 60 / hourSegments

  const r = (a, b) => Math.floor(Math.random() * (b - a)) + a

  const getColour = (modules) => {
    const tag = modules.map((m) => m.text).join(',')
    if (!colours[tag]) {
      colours[tag] = `rgb(${r(160, 220)}, ${r(160, 220)}, ${r(160, 220)})`
    }
    return colours[tag]
  }

  $: row = (time) =>
    (time.hour - $options.start) * hourSegments + time.minute / interval + 1
</script>

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

  :global(main.dark) .class {
    background: var(--class) !important;
  }

  .class.full {
    font-size: 1rem;
    margin: 1rem;

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
    margin-top: 0.25rem;

    display: flex;
  }

  .icon svg {
    display: inline-block;
    width: 1em;
    height: 1em;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .icon > svg + * {
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

  .open,
  .close {
    cursor: pointer;
    font-weight: bold;
    text-align: right;

    margin-left: 0.5rem;
  }

  .class.full .titles {
    font-size: 1.2rem;
  }
</style>

<div
  class="class"
  class:full
  style="grid-row: {row(info.from)} / {row(info.to)}; background: {getColour(info.modules)}"
  on:click={clickFull}>
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
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={mod.link}>{mod.text}</a>{#if i !== info.modules.length - 1}
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path
            d="M21.4 97.2a34.9 34.9 0 01-11.1-7.5 34.9 34.9 0 01-7.5-11A34.8 34.8 0 010 65a34.8 34.8 0 012.8-13.6 34.9 34.9 0 017.5-11.1 35 35 0 0111-7.5A34.8 34.8 0 0135 30a34.8 34.8 0 0113.6 2.8 35 35 0 0111.1 7.5 35 35 0 017.5 11A34.8 34.8 0 0170 65a34.8 34.8 0 01-2.7 13.6 34.9 34.9 0 01-7.5 11.2 35 35 0 01-11.2 7.5A34.8 34.8 0 0135 100a34.8 34.8 0 01-13.6-2.8zm2.7-58a27.9 27.9 0 00-8.9 6 28 28 0 00-6 8.9A27.8 27.8 0 007 65a27.8 27.8 0 002.2 10.9 27.9 27.9 0 006 8.9 28 28 0 008.9 6A27.8 27.8 0 0035 93a27.8 27.8 0 0010.9-2.2 28 28 0 008.9-6 28 28 0 006-8.9A27.8 27.8 0 0063 65a27.8 27.8 0 00-2.2-10.9 28 28 0 00-6-8.9 27.9 27.9 0 00-8.9-6A27.8 27.8 0 0035 37a27.8 27.8 0 00-10.9 2.2zM32 68V45h6v17h7v6zm48-1.4V65a45.5 45.5 0 00-.4-6 28.1 28.1 0 005.2-4.2 28 28 0 006-8.9A27.8 27.8 0 0093 35a27.8 27.8 0 00-2.2-10.9 27.9 27.9 0 00-6-8.9 28 28 0 00-8.9-6A27.8 27.8 0 0065 7a27.8 27.8 0 00-10.9 2.2 27.9 27.9 0 00-8.9 6 28 28 0 00-4.1 5.2A45.7 45.7 0 0035 20h-1.6a34.9 34.9 0 016.9-9.7 34.9 34.9 0 0111-7.5A34.8 34.8 0 0165 0a34.8 34.8 0 0113.6 2.8 34.9 34.9 0 0111.1 7.5 35 35 0 017.5 11A34.8 34.8 0 01100 35a34.8 34.8 0 01-2.7 13.6 34.9 34.9 0 01-7.5 11.1 35 35 0 01-9.8 7zM75 38h-4a45.2 45.2 0 00-9-9V15h6v17h7v6z" />
        </svg>
      </div>
    {/if}
    {#if full}
      <p class="close" on:click={click}>✕</p>
    {/if}
  </div>
  {#if info.moduleTitles.length > 0}
    <p class="hide titles bold">{info.moduleTitles.join(', ')}</p>
  {:else}
    <p class="hide titles bold none">[no title]</p>
  {/if}
  <p class="hide">{getTitle(info)}</p>
  {#if info.method}
    <p>{getMethod(info.method)}</p>
  {/if}
  {#if full}
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path
          d="M30.5 96a49.9 49.9 0 01-15.9-10.6A49.8 49.8 0 014 69.4 49.7 49.7 0 010 50a49.7 49.7 0 014-19.5 49.8 49.8 0 0110.6-15.9A49.9 49.9 0 0130.6 4 49.7 49.7 0 0150 0a49.7 49.7 0 0119.5 4 49.9 49.9 0 0115.9 10.6 49.8 49.8 0 0110.7 16A49.7 49.7 0 01100 50a49.7 49.7 0 01-4 19.5 49.8 49.8 0 01-10.6 15.9 49.9 49.9 0 01-16 10.7A49.7 49.7 0 0150 100a49.7 49.7 0 01-19.5-4zm4-82.9a39.9 39.9 0 00-12.8 8.6 39.9 39.9 0 00-8.6 12.7A39.8 39.8 0 0010 50a39.8 39.8 0 003.1 15.6 39.9 39.9 0 008.6 12.7 39.9 39.9 0 0012.7 8.6A39.8 39.8 0 0050 90a39.8 39.8 0 0015.6-3.1 39.9 39.9 0 0012.7-8.6 39.9 39.9 0 008.6-12.7A39.7 39.7 0 0090 50a39.7 39.7 0 00-3.1-15.6 39.9 39.9 0 00-8.6-12.7 39.9 39.9 0 00-12.7-8.6A39.8 39.8 0 0050 10a39.8 39.8 0 00-15.6 3.1zM45 55V20h10v25h15v10z" />
      </svg>

      <p>{showTime(info.from)} to {showTime(info.to)}</p>
    </div>
  {/if}
  {#if info.location.text}
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path
          d="M50 100a129.7 129.7 0 01-17.5-19.4 103.2 103.2 0 01-12-20.7A64 64 0 0115 35a34.8 34.8 0 012.8-13.6 34.9 34.9 0 017.5-11.1 34.9 34.9 0 0111-7.5A34.8 34.8 0 0150 0a34.8 34.8 0 0113.6 2.7 34.9 34.9 0 0111.1 7.5 34.9 34.9 0 017.5 11.2A34.8 34.8 0 0185 35a63.6 63.6 0 01-5.4 25 102.8 102.8 0 01-12 20.6A129.4 129.4 0 0150 100zm0-80a14.9 14.9 0 00-10.6 4.4A14.9 14.9 0 0035 35a14.9 14.9 0 004.4 10.6A14.9 14.9 0 0050 50a14.9 14.9 0 0010.6-4.4A14.9 14.9 0 0065 35a14.9 14.9 0 00-4.4-10.6A14.9 14.9 0 0050 20z" />
      </svg>
      {#if info.location.link}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={info.location.link}>{info.location.text}</a>
      {:else}
        <p>{info.location.text}</p>
      {/if}
    </div>
  {/if}
  {#if full}
    {#if info.teachers.length > 0}
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path
            d="M50 100h-.6a49.7 49.7 0 01-17.3-3.3H32l-2.7-1.2h-.1A49.8 49.8 0 0115 85.8v-.2h-.1l-.1-.1-.2-.1A49.8 49.8 0 014 69.4 49.7 49.7 0 010 50a49.7 49.7 0 014-19.5 49.8 49.8 0 0110.6-15.9A49.8 49.8 0 0130.6 4 49.7 49.7 0 0150 0a49.7 49.7 0 0119.5 4 49.8 49.8 0 0115.9 10.6 49.8 49.8 0 0110.7 16A49.7 49.7 0 01100 50a49.7 49.7 0 01-4 19.5 49.8 49.8 0 01-10.6 15.9 49.8 49.8 0 01-15 10.2l-2.2 1H68a49.7 49.7 0 01-17.5 3.4H50zm33-27.5a39.9 39.9 0 003.9-7A39.7 39.7 0 0090 50a39.7 39.7 0 00-3.1-15.6 39.9 39.9 0 00-8.6-12.7 39.9 39.9 0 00-12.7-8.6A39.7 39.7 0 0050 10a39.7 39.7 0 00-15.6 3.1 39.9 39.9 0 00-12.7 8.6 39.9 39.9 0 00-8.6 12.7A39.8 39.8 0 0010 50a39.8 39.8 0 003.1 15.6 39.9 39.9 0 003.8 6.9A49.8 49.8 0 0150 60a49.8 49.8 0 0133 12.5zM35 40a15 15 0 0115-15 15 15 0 0115 15 15 15 0 01-15 15 15 15 0 01-15-15z" />
        </svg>
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path
            d="M10 100A10 10 0 010 90V10A10 10 0 0110 0h80a10 10 0 0110 10v80a10 10 0 01-10 10zm0-10h80V30H10zm15-10a5 5 0 01-5-5 5 5 0 015-5h36a5 5 0 015 5 5 5 0 01-5 5zm0-15a5 5 0 01-5-5 5 5 0 015-5h50a5 5 0 015 5 5 5 0 01-5 5zm0-15a5 5 0 01-5-5 5 5 0 015-5h41a5 5 0 015 5 5 5 0 01-5 5z" />
        </svg>
        <div>
          {#each info.notes as note}
            <p>{note}</p>
          {/each}
        </div>
      </div>
    {/if}
    {#if info.link}
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path
            d="M20 100a19.9 19.9 0 01-7.8-1.6A20 20 0 016 94.1a20 20 0 01-4.3-6.3A19.9 19.9 0 010 80V20a19.9 19.9 0 011.6-7.8A20 20 0 015.9 6a20 20 0 016.3-4.3A19.9 19.9 0 0120 0h30v10H20a10 10 0 00-10 10v60a10 10 0 0010 10h60a10 10 0 0010-10V50h10v30a19.9 19.9 0 01-1.6 7.8 20 20 0 01-4.3 6.3 20 20 0 01-6.3 4.3A19.9 19.9 0 0180 100zm25.9-53l37-37H60V0h40v40H90V17L53 54.2z" />
        </svg>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={info.link.link}>{info.link.text}</a>
      </div>
    {/if}
  {/if}
  {#if full && info.alternativeTimes}
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path
          d="M21.4 97.2a34.9 34.9 0 01-11.1-7.5 34.9 34.9 0 01-7.5-11A34.8 34.8 0 010 65a34.8 34.8 0 012.8-13.6 34.9 34.9 0 017.5-11.1 35 35 0 0111-7.5A34.8 34.8 0 0135 30a34.8 34.8 0 0113.6 2.8 35 35 0 0111.1 7.5 35 35 0 017.5 11A34.8 34.8 0 0170 65a34.8 34.8 0 01-2.7 13.6 34.9 34.9 0 01-7.5 11.2 35 35 0 01-11.2 7.5A34.8 34.8 0 0135 100a34.8 34.8 0 01-13.6-2.8zm2.7-58a27.9 27.9 0 00-8.9 6 28 28 0 00-6 8.9A27.8 27.8 0 007 65a27.8 27.8 0 002.2 10.9 27.9 27.9 0 006 8.9 28 28 0 008.9 6A27.8 27.8 0 0035 93a27.8 27.8 0 0010.9-2.2 28 28 0 008.9-6 28 28 0 006-8.9A27.8 27.8 0 0063 65a27.8 27.8 0 00-2.2-10.9 28 28 0 00-6-8.9 27.9 27.9 0 00-8.9-6A27.8 27.8 0 0035 37a27.8 27.8 0 00-10.9 2.2zM32 68V45h6v17h7v6zm48-1.4V65a45.5 45.5 0 00-.4-6 28.1 28.1 0 005.2-4.2 28 28 0 006-8.9A27.8 27.8 0 0093 35a27.8 27.8 0 00-2.2-10.9 27.9 27.9 0 00-6-8.9 28 28 0 00-8.9-6A27.8 27.8 0 0065 7a27.8 27.8 0 00-10.9 2.2 27.9 27.9 0 00-8.9 6 28 28 0 00-4.1 5.2A45.7 45.7 0 0035 20h-1.6a34.9 34.9 0 016.9-9.7 34.9 34.9 0 0111-7.5A34.8 34.8 0 0165 0a34.8 34.8 0 0113.6 2.8 34.9 34.9 0 0111.1 7.5 35 35 0 017.5 11A34.8 34.8 0 01100 35a34.8 34.8 0 01-2.7 13.6 34.9 34.9 0 01-7.5 11.1 35 35 0 01-9.8 7zM75 38h-4a45.2 45.2 0 00-9-9V15h6v17h7v6z" />
      </svg>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={info.alternativeTimes.link}>Alternative times</a>
    </div>
  {/if}
</div>
