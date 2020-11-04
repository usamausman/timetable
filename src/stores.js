import { readable, writable, derived } from 'svelte/store'
import {
  addMinutes,
  startOfDay,
  startOfMinute,
  differenceInMinutes,
} from 'date-fns'

const localStore = (key, initial, parser = (k, v) => v, check = (v) => v) => {
  const saved = JSON.parse(localStorage.getItem(key), parser)
  const store = writable(check(saved) || initial)
  store.subscribe((value) => {
    localStorage.setItem(key, JSON.stringify(value))
  })
  return store
}

export const time = readable(new Date(), (set) => {
  let n = 0
  const interval = setInterval(() => {
    let a = new Date()
    set(a)
  }, 100)

  return () => {
    clearInterval(interval)
  }
})

export const hour = derived(time, ($time) => $time.getHours())

export const minute = derived(time, ($time) => startOfMinute($time).getTime())

export const date = derived(time, ($time) => startOfDay($time).getTime())

export const options = localStore('options', {
  start: 9,
  end: 18,
  dark: window.matchMedia('(prefers-color-scheme: dark)').matches,
  notifications: false,
  notificationsMinutesBefore: 5,
})

export const info = localStore('info', {
  identifier: '',
  year: '',
})

export const timetable = localStore(
  'timetable',
  [],
  (k, v) => {
    if (
      typeof v === 'string' &&
      v.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
    ) {
      return new Date(v)
    }
    return v
  },
  (saved) => saved && saved[0] && saved[0].time && saved
)

export const nextClass = derived(
  [minute, options, timetable],
  ([$minute, $options, $timetable]) => {
    if ($options.notifications) {
      const checkTime = addMinutes($minute, $options.notificationsMinutesBefore)
      const checkDay = startOfDay(checkTime)

      return $timetable
        .filter(
          (_class) =>
            addMinutes(checkTime, -$options.notificationsMinutesBefore) <=
              _class.time && _class.time <= checkTime
        )
        .map((_class) => {
          const now = new Date($minute)
          const start = _class.time

          return { _class, minutesTill: -differenceInMinutes(now, start) }
        })
    }

    return []
  }
)

export const line = derived(
  [time, options],
  ([$time, $options]) =>
    ($time.getHours() - $options.start + $time.getMinutes() / 60) /
    ($options.end - $options.start)
)
