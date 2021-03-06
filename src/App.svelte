<script context="module">
  export const hourSegments = 4
</script>

<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, scale } from 'svelte/transition'
  import { add, differenceInDays, format, isSameDay } from 'date-fns'
  import { createEvents } from 'ics'

  import {
    date,
    hour,
    info,
    line,
    nextClass,
    options,
    timetable,
  } from './stores'
  import { buildURL, showTime } from './util'

  import Class, { notify, parseClass, toEvent } from './Class.svelte'

  let offset = 0
  let shouldAlign = false

  let fetching

  let showClass
  let showOptions
  let data

  let count = 7
  let vh
  let shadow
  let url

  const fetchTimetable = async (year, identifier) => {
    const inner = async () => {
      let res
      try {
        res = await fetch(buildURL(year, identifier))
        $info.lastFetched = new Date()
      } catch {
        throw new Error(
          'Timetable could not be fetched, please check your connection'
        )
      }
      const text = await res.text()
      const parser = new DOMParser()
      const root = parser.parseFromString(text, 'text/html').body

      // 1-indexed week, which is a Monday
      const startDate = add(
        new Date(
          Date.parse(
            (root.querySelector('span.header-3-0-22') as HTMLElement).innerText
          )
        ),
        { days: -8 }
      )

      const weekdays = Array.from(
        root.querySelectorAll('table.spreadsheet')
      ).map((e) =>
        Array.from(e.querySelectorAll('tr:not([class])')).map((el) =>
          Array.from(el.children)
        )
      )

      // put Sunday first
      weekdays.unshift(weekdays.pop())

      return weekdays.flatMap((classes, weekday) =>
        classes.flatMap((_class) =>
          parseClass(_class, startDate, weekday, $info.year)
        )
      )
    }

    return (fetching = inner())
  }

  const getTimetable = async () => {
    const params = new URLSearchParams(url)
    const identifier = params.get('identifier')
    const year = url.match(/teaching\/(\d+)\//)[1]

    if (!identifier) {
      throw new Error('Incorrect URL, please follow the steps again')
    }

    try {
      $timetable = await fetchTimetable(year, identifier)
      $info.year = year
      $info.identifier = identifier
    } catch (e) {
      console.error(e)
    }
  }

  const downloadTimetable = () => {
    const year = Number($info.year.substr(0, 4))
    const name = `Leeds ${year}-${year + 1}`

    const all = $timetable.flatMap((c) => toEvent(c, name))

    const { error, value: calendar } = createEvents(all)

    if (!error) {
      const a = document.createElement('a')
      a.href = 'data:text/calendar;charset=utf8,' + escape(calendar)
      a.download = name
      a.click()
    }
  }

  const getTimes = (base, offset, currentHour, from, to) => {
    const day = add(base, { days: offset })
    return [...Array(to - from)].map((_, i) => {
      const hour = from + i
      return {
        time: showTime(add(day, { hours: hour })),
        now: currentHour === hour,
      }
    })
  }

  const getDays = (base, offset, count, timetable) => {
    const baseDate = new Date(base)

    return [...Array(count)].map((_, i) => {
      const day = add(baseDate, { days: offset + i })

      const classes = timetable.filter((_class) => isSameDay(_class.time, day))

      return {
        day,
        date: {
          day: format(day, 'EEEE'),
          date: format(
            day,
            day.getFullYear() === baseDate.getFullYear()
              ? 'd MMM'
              : 'd MMM yyyy'
          ),
        },
        classes,
        today: offset + i === 0,
        weekend: day.getDay() === 0 || day.getDay() === 6,
      }
    })
  }

  const refreshTimetable = async () => {
    $timetable = await fetchTimetable($info.year, $info.identifier)
  }

  const resetTimetable = () => {
    close()
    $timetable = []
    $info.identifier = ''
    $info.year = ''
  }

  const getAndDownloadTimetable = async () => {
    await getTimetable()
    downloadTimetable()
    resetTimetable()
  }

  const scroll = () => {
    shadow = window.scrollY > 0
  }

  const show = (_class) => {
    showClass = true
    data = _class
  }

  const close = () => {
    showClass = false
    showOptions = false
  }

  const check = async (v) => {
    if (v) {
      if (Notification.permission === 'granted') {
        $options.notifications = true
        return
      }

      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          $options.notifications = true
        } else {
          $options.notifications = false
        }
      }
    }
  }

  const resize = () => {
    let temp = Math.floor(document.body.offsetWidth / 160)
    temp = Math.max(2, Math.min(temp, 7))
    count = temp
    shouldAlign = count === 7

    vh = window.innerHeight / 100
  }

  const register = async () => {
    if (!('serviceWorker' in navigator)) {
      return
    }

    // remove old service worker
    ;(await navigator.serviceWorker.getRegistrations())
      .filter((r) => r.active.scriptURL.includes('cs30'))
      .forEach((r) => r.unregister())

    await navigator.serviceWorker.register('worker.js')
  }

  onMount(resize)
  onMount(register)
  onMount(async () => {
    // remove old localStorage data
    if (localStorage.getItem('cached')) {
      if (localStorage.getItem('identifier') !== '') {
        const oldInfo = {
          identifier: localStorage.getItem('identifier'),
          year: localStorage.getItem('yearRange'),
        }
        $timetable = await fetchTimetable(oldInfo.year, oldInfo.identifier)
        $info = oldInfo
        $options.notifications = !!JSON.parse(localStorage.getItem('notify'))
        $options.dark = localStorage.getItem('mode') === 'dark'

        localStorage.removeItem('identifier')
        localStorage.removeItem('yearRange')
        localStorage.removeItem('notify')
        localStorage.removeItem('mode')
        localStorage.removeItem('cached')
      }
    }

    if ($info.lastFetched === undefined) {
      $info.lastFetched = new Date()
    }

    if ($options.refreshAfter === undefined) {
      $options.refreshAfter = 7
    }

    // reset class times
    const t = JSON.parse(localStorage.getItem('timetable'))
    if (t && t.length === 0 && $info.year && $info.identifier) {
      $timetable = await fetchTimetable($info.year, $info.identifier)
    }

    if (
      $options.refreshAfter >= 0 &&
      differenceInDays($date, $info.lastFetched) >= $options.refreshAfter
      ) {
        refreshTimetable()
    }
  })

  $: check($options.notifications)
  $: $nextClass.map(notify)
  $: alignToWeek = shouldAlign ? -((new Date($date).getDay() + 6) % 7) : 0
  $: times = getTimes(
    $date,
    offset + alignToWeek,
    $hour,
    $options.start,
    $options.end
  )
  $: days = getDays($date, offset + alignToWeek, count, $timetable)
</script>

<style>
  main {
    --bg: #fff;
    --bg-90: #ffffffcc;

    --today: #fdd;
    --today-90: #ffddddcc;

    --weekend: #eee;
    --weekend-90: #eeeeeecc;

    --bg-mid: #eee;

    --class: #ccc;
    --now: #f00;
    --text: #333;
    --danger: #b00;

    background: var(--bg);
    color: var(--text);

    min-height: 100vh;
    min-height: calc(100 * var(--vh, 1vh));
  }

  main.dark {
    --bg: #222;
    --bg-90: #222222cc;

    --today: #422;
    --today-90: #442222cc;

    --weekend: #1d1d1d;
    --weekend-90: #1d1d1dcc;

    --bg-mid: #111;

    --class: #333;
    --now: #f00;
    --text: #aaa;
    --danger: #c44;
  }

  label {
    display: inline-block;
    padding-right: 1rem;
  }

  :global(input#identifier) {
    width: 100%;
  }

  input[type='text'],
  input[type='number'],
  select {
    background: var(--bg-mid);
    color: var(--text);
    margin: 0;
    border: none;
    border-radius: 0.25rem;
    box-shadow: inset 0 -0.125rem 0 0 var(--text);
  }

  input[type='checkbox'] {
    margin: 0;
    margin-top: 0.25rem;
  }

  button {
    margin: 0;
    padding: 0.25rem 0.5rem;

    display: inline;

    background: var(--text);
    border: none;
    color: var(--bg);
    border-radius: 0.25rem;

    cursor: pointer;
  }

  button:disabled {
    opacity: 0.7;

    cursor: initial;
  }

  button.danger {
    background: var(--danger);
  }

  button + button {
    margin-left: 0.5rem;
  }

  :global(svg path) {
    fill: currentColor;
  }

  /* INITIAL FORM */

  div.info {
    height: 100%;
    max-width: 50rem;
    margin: 0 auto;
    padding: 1rem;
  }

  .info .buttons {
    display: flex;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .info .buttons div + div {
    margin-left: 0.5rem;
  }

  div.input {
    display: flex;
    align-items: baseline;
    flex-wrap: nowrap;
  }

  /* GRID */

  div.grid {
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

    padding: 0.25rem;
  }

  nav button.today {
    background: var(--today);
    color: var(--now);
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

  /* MODAL */

  .bg {
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
    background: rgba(0, 0, 0, 0.3);
  }

  .modal {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  .uniform label {
    min-width: 100px;
  }

  .bg .options {
    background: var(--bg);
    border-radius: 0.5rem;
    margin: 1rem;
    padding: 1rem;
    max-width: 24rem;
    width: 100%;
  }

  .bg .options h2 {
    margin-top: 0;
  }

  .bg .options > * + * {
    margin-top: 0.5rem;
  }

  .bg .options .buttons {
    display: flex;
    justify-content: flex-end;
  }

  .bg .options .buttons button {
    width: 100%;
  }

  fieldset {
    margin: 0;
    padding: 0;
    border: none;

    transition: opacity 0.25s ease;
  }

  fieldset[disabled] {
    opacity: 0.5;
  }

  .inline {
    display: flex;
    align-items: baseline;
  }

  .inline input {
    width: auto;
    margin: 0 0.25rem;
  }
</style>

<svelte:window on:resize={resize} on:scroll={scroll} />

<svelte:head>
  <meta name="theme-color" content={$options.dark ? '#222' : '#fff'} />
  {#if $options.dark}<style>
      body {
        background: #222;
      }
    </style>{/if}
</svelte:head>

<main
  class:dark={$options.dark}
  style="--vh: {vh}px; --segments: {hourSegments};"
>
  {#if !$info.identifier}
    <div class="info">
      <h1>University of Leeds Timetable</h1>
      <p>
        This app will keep a copy of your timetable so that you can see it even
        if you are offline! You can also see the location of classes, with a
        link to find them on campus.
      </p>
      <p>
        If you prefer, you can also download the timetable to use in your own
        calendar app.
      </p>
      <h2>Steps</h2>
      <ol>
        <!-- <li>
          Sign in to
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://minerva.leeds.ac.uk/">Minerva</a
          >
        </li>
        <li>Click the timetable icon</li>
        <li>Choose either 'Week View' or 'Semester View'</li> -->
        <li>
          Sign in to
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://studentservices.leeds.ac.uk/">Student Services</a
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
      <div class="input">
        <label class="small" for="identifier">URL:</label>
        <input
          bind:value={url}
          type="text"
          id="identifier"
          placeholder="timetable.leeds.ac.uk/teaching/..."
        />
      </div>
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
      {#await fetching}{:catch e}
        <p style="color: red;">{e.message}</p>
      {/await}
    </div>
  {:else}
    <div class="grid" style="--start: {$options.start}; --end: {$options.end};">
      <div class="top" class:shadow>
        <div class="options">
          <div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 100 100"
              on:click={() => (showOptions = true)}
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
          <button
            on:click={() => {
              offset -= 7
            }}
            id="bk7">&lt;&lt;</button
          >
          <button
            on:click={() => {
              offset -= 1
            }}
            id="bk">&lt;</button
          >
          <button
            class="today"
            on:click={() => {
              offset = 0
            }}
            id="fd">today</button
          >
          <button
            on:click={() => {
              offset += 1
            }}
            id="fd">&gt;</button
          >
          <button
            on:click={() => {
              offset += 7
            }}
            id="fd7">&gt;&gt;</button
          >
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
            <p
              class:now
              style="grid-row: time-start {i * hourSegments +
                1} / span {hourSegments}"
            >
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
              <Class {info} click={() => show(info)} />
            {/each}
          </div>
        {/each}
      </div>

      {#if showClass || showOptions}
        <section class="bg" transition:fade on:click={close}>
          <div class="modal" transition:scale={{ start: 0.9 }}>
            {#if showClass}
              <Class full info={data} click={close} />
            {:else}
              <div class="options" on:click|stopPropagation={() => {}}>
                <h2>Options</h2>
                <div class="uniform input">
                  <label for="start">Start Time</label>
                  <input
                    type="number"
                    min="0"
                    max={$options.end}
                    id="start"
                    bind:value={$options.start}
                  />
                </div>
                <div class="uniform input">
                  <label for="end">End Time</label>
                  <input
                    type="number"
                    min={$options.start}
                    max="24"
                    id="end"
                    bind:value={$options.end}
                  />
                </div>
                <div class="uniform input">
                  <label for="refreshAfter">Auto-refresh</label>
                  <select bind:value={$options.refreshAfter} id="refreshAfter">
                    <option value={-1}>Never</option>
                    <option value={0}>Always</option>
                    <option value={1}>After 1 day</option>
                    <option value={7}>After 7 days</option>
                  </select>
                </div>
                <div class="uniform input">
                  <label for="notifications">Notifications</label>
                  <input
                    disabled={!('Notification' in window) ||
                      window.Notification.permission === 'denied'}
                    type="checkbox"
                    id="notifications"
                    bind:checked={$options.notifications}
                  />
                </div>
                {#if !('Notification' in window)}
                  <p style="color: var(--now);">
                    Notifications are not supported.
                  </p>
                {/if}
                {#if window.Notification.permission === 'denied'}
                  <p style="color: var(--now);">
                    Permission for notifications was denied.
                  </p>
                {/if}
                <fieldset
                  disabled={!$options.notifications ||
                    !('Notification' in window) ||
                    window.Notification.permission === 'denied'}
                >
                  <div class="inline input">
                    <p>Notify me</p>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      bind:value={$options.notificationsMinutesBefore}
                    />
                    <p>minutes before a class</p>
                  </div>
                </fieldset>

                <details>
                  <summary>
                    <span>Debug Info</span>
                  </summary>

                  <code style="white-space: pre-wrap; overflow: scroll;">
                    {JSON.stringify($info, null, 2)}
                  </code>
                </details>

                {#await fetching}{:catch e}
                  <p style="color: red;">{e.message}</p>
                {/await}

                <div class="buttons">
                  {#await fetching}
                    <button disabled>Refreshing Timetable...</button>
                  {:then _}
                    <button on:click={refreshTimetable}
                      >Refresh Timetable</button
                    >
                  {:catch e}
                    <button on:click={refreshTimetable}
                      >Refresh Timetable</button
                    >
                  {/await}
                  <button on:click={downloadTimetable}
                    >Download Timetable</button
                  >
                </div>
                <div class="buttons">
                  <button class="danger" on:click={resetTimetable}
                    >Reset Timetable</button
                  >
                </div>

                <!-- <div class="uniform input">
                  <label for="options">Debug Info</label>
                  <pre
                    name="options"
                    id="options" style="height: 10rem; overflow: scroll; margin: 0;">
                    {JSON.stringify({ options: $options, info: $info, time: $hour, day: $date, offset: timeOffset(new Date()) }, null, 2)}
                  </pre>
                </div> -->
              </div>
            {/if}
          </div>
        </section>
      {/if}
    </div>
  {/if}
</main>
