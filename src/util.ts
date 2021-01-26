import { format } from 'date-fns'
import type { Link } from './types'

export const timetableURL = (year) =>
  `http://timetable.leeds.ac.uk/teaching/${year}/reporting`

export const buildURL = (year, identifier) =>
  `https://cors-anywhere.herokuapp.com/${timetableURL(
    year
  )}/textspreadsheet;?objectclass=student+set&idtype=id&identifier=${identifier}&template=SWSCUST+Student+Set+Individual+semester&days=1-7&periods=1-21&weeks=1-44`

export const r = (a: number, b: number): number =>
  Math.floor(Math.random() * (b - a)) + a

export const showTime = (time: Date) =>
  time.getMinutes() === 0 ? format(time, 'h a') : format(time, 'p')

export const makeLink = ({ innerText: text, href: link = '' }): Link => {
  return { text: text.trim(), link }
}

export const getElements = (el, selector): HTMLElement[] =>
  Array.from(el.querySelectorAll(selector))

export const getLink = (el, required = true): Link => {
  const els = getElements(el, 'a')

  if (els.length) {
    return makeLink(els[0])
  } else if (required) {
    return makeLink(el)
  }
}

export const getLinks = (el, required = true): Link[] => {
  const els = getElements(el, 'a')

  if (els.length) {
    return els.map(makeLink)
  } else if (required) {
    return el.innerText.split(';').map((t) => makeLink({ innerText: t }))
  }
}
