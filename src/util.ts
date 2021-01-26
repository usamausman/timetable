import type { ClassInfo } from './types'

export const getElements = (el, selector): HTMLElement[] =>
  Array.from(el.querySelectorAll(selector))

export const getMethod = (method: string): string => {
  const m = method.toLowerCase().replace(/(\[\])/g, '')

  if (m.includes('on campus')) {
    return 'On Campus'
  } else if (m.includes('live') || m.includes('online')) {
    if (m.includes('collaborate')) return 'Online: Collaborate'
    if (m.includes('teams')) return 'Online: Teams'
    if (m.includes('zoom')) return 'Online: Zoom'
    if (m.includes('minerva')) return 'Online: See Minerva'
    return 'Online: Live'
  } else if (m.includes('pre-recorded')) {
    return 'Prerecorded: See Minerva'
  } else {
    return m
  }
}

export const getTitle = (info: ClassInfo): string => {
  if (info.title.includes('/')) {
    const segment = info.title.split('/')[info.modules.length]
    let [type, number] = segment.toLowerCase().split(' ')

    number = number || '1'

    if (type === 'drop-in') return 'Drop-In ' + number
    else if (type === 'lab') return 'Lab ' + number
    else if (type === 'lec') return 'Lecture ' + number
    else if (type === 'prc') return 'Practical ' + number
    else if (type === 'smr') return 'Seminar ' + number
    else if (type === 'tut') return 'Tutorial ' + number
    // handle 01 JA
    else if (!isNaN(Number(type))) return info.title
    else return segment
  } else {
    return info.title
  }
}

export const r = (a: number, b: number): number =>
  Math.floor(Math.random() * (b - a)) + a

export const showTime = (time: Date) =>
  time.getMinutes() === 0 ? format(time, 'h a') : format(time, 'p')

export const tzOffset = (time) =>
  differenceInMinutes(utcToZonedTime(time, 'Europe/London'), time)
