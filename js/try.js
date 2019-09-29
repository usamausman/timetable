const STRINGS = {
  months: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  days: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ],
}

const getNow = () => {
  // const base = new Date(2019, 9, 16, 10, 50)
  // const offset = new Date(base.getTime() + off * 4 * 1000)
  // off += 1
  return new Date()
}
const baseDate = new Date(2018, 8, 24)

const getYear = (date) => {
  const day = date || getNow()
  const month = day.getMonth()
  const year = day.getFullYear()
  if (month < 7) {
    return year - 1
  }
  return year
}

const toRange = (year) => `${year}${(year % 100) + 1}`

const timetableLink = `http://timetable.leeds.ac.uk/teaching/${toRange(
  getYear()
)}/reporting`

const buildURL = (identifier) =>
  `https://cors-anywhere.herokuapp.com/${timetableLink}/textspreadsheet;?objectclass=student+set&idtype=id&identifier=${identifier}&template=SWSCUST+Student+Set+Individual+semester&days=1-7&periods=1-21&weeks=1-44`

const buildWeekURL = (identifier, week) =>
  `https://cors-anywhere.herokuapp.com/${timetableLink}/textspreadsheet;?objectclass=student+set&idtype=id&identifier=${identifier}&template=SWSCUST+Student+Set+Individual+week&periods=1-21&weeks=${week}`;


const getCache = () => {
  const mode = localStorage.getItem('mode')
  const notify = JSON.parse(localStorage.getItem('notify')) || false
  const identifier = localStorage.getItem('identifier')
  const yearRange = localStorage.getItem('yearRange')
  const cached = JSON.parse(localStorage.getItem('cached')) || false
  let timetable = ''
  try {
    timetable = JSON.parse(localStorage.getItem('timetable'))
  } finally {
    return {mode, notify, identifier, cached, yearRange, timetable}
  }
}

const setCache = ({
                    mode,
                    notify,
                    identifier,
                    cached,
                    yearRange,
                    timetable,
                  }) => {
  if (mode !== undefined) {
    localStorage.setItem('mode', mode)
  }
  if (notify !== undefined) {
    localStorage.setItem('notify', notify)
  }
  if (identifier !== undefined) {
    localStorage.setItem('identifier', identifier)
  }
  if (cached !== undefined) {
    localStorage.setItem('cached', cached)
  }
  if (yearRange !== undefined) {
    localStorage.setItem('yearRange', yearRange)
  }
  if (timetable !== undefined) {
    localStorage.setItem('timetable', JSON.stringify(timetable))
  }
}

const doDownload = async (downloadButton) => {
  try {
    const {
      identifier,
    } = getCache();

    let classes = [];
    for (let i = 0; i <= 35; i++) { // say there's 35 weeks
      const url = buildWeekURL(identifier, i);
      downloadButton.textContent = `Fetching week ${i}`;
      const timetable = await fetchAndParseTimetable(url);
      const weekClassArray = Object.values(timetable);
      classes = classes.concat(weekClassArray)
    }

    const cal = ics();
    for (let i = 0; i < classes.length; i++) {
      const {
        title,
        code,
        location,
        locationLink,
        note,
        teacher,
        type,
        startDate,
        endDate,
        alternativeTimesLink
      } = classes[i];

      const subject = title;
      const description = `${type} - ${teacher} (${code}) ${
        alternativeTimesLink ? ("Alternative times: " + alternativeTimesLink + " ") : ""
        }${note}`;
      const formattedLocationLink = locationLink ? ` (${locationLink})` : "";
      const formattedLocation = `${location}${formattedLocationLink}`;

      cal.addEvent(
        subject,
        description,
        formattedLocation,
        startDate.toString(),
        endDate.toString()
      );
    }
    cal.download(`uol_timetable_${getYear()}.ics`);

  } catch (e) {
    console.error(e)
    alert('There was a problem fetching your timetable, please try again')
  }
};

const attachToForm = () => {
  const getIdentifier = (text) => {
    const match = text.match(/.*identifier=(\d+).*/)
    return match ? match[1] : ''
  }

  const linkInput = document.querySelector('input#link')
  const linkForm = document.querySelector('form')
  const retrieveButton = document.querySelector('#retrieve');
  const downloadButton = document.querySelector('#download');

  downloadButton.addEventListener("click", async (e) => {
    const identifier = getIdentifier(linkInput.value);
    if (identifier) {
      linkInput.disabled = true;
      downloadButton.disabled = true;

      setCache({identifier});
      await doDownload(downloadButton);

      linkInput.disabled = false;
      downloadButton.textContent = 'Download complete!'
    } else {
      alert('Invalid link or `identifier` parameter is missing')
    }
  });

  linkForm.addEventListener('submit', async (e) => {
    e.preventDefault()
    const identifier = getIdentifier(linkInput.value)
    if (identifier) {
      retrieveButton.textContent = 'Checking...'
      linkInput.disabled = true
      retrieveButton.disabled = true

      const url = buildURL(identifier)
      const response = await fetch(url)
      if (response.ok) {
        setCache({identifier})
        go()
      } else {
        alert('`identifier` parameter is incorrect')
      }

      linkInput.disabled = false
      retrieveButton.disabled = false
      retrieveButton.textContent = 'Retrieve Timetable'
    } else {
      alert('Invalid link or `identifier` parameter is missing')
    }
  })
}

const attachOptions = () => {
  const update = document.querySelector('#update')
  const mode = document.querySelector('#mode')

  update.addEventListener('click', async () => {
    update.classList.add('updating')
    const {identifier} = getCache()
    if (!identifier) {
      document.body.classList.add('noInfo')
      alert('`identifier` is missing, please paste link again')
    } else {
      if (!navigator.onLine) {
        alert('Network is offline')
      } else {
        setCache({cached: false})
        await go()
      }
    }
    update.classList.remove('updating')
  })

  mode.addEventListener('click', () => {
    if (document.body.classList.contains('dark')) {
      setCache({mode: ''})
    } else {
      setCache({mode: 'dark'})
    }
    checkMode()
  })
}

const attachNavigation = () => {
  const prev = document.querySelector('svg.prev')
  const next = document.querySelector('svg.next')

  prev.addEventListener('click', () => (offset -= 1))
  next.addEventListener('click', () => (offset += 1))
}

const attachNotify = () => {
  const notifyDiv = document.querySelector('div.notifications')
  const shouldNotify = document.querySelector('input#notify')

  const {notify} = getCache()
  shouldNotify.checked = notify

  if ('Notification' in window && navigator.serviceWorker) {
    shouldNotify.addEventListener('change', async () => {
      if (shouldNotify.checked) {
        if (Notification.permission === 'denied') {
          alert('Permission for Notifications has been denied by your browser')
          shouldNotify.checked = false
        } else if (Notification.permission !== 'granted') {
          const permission = await Notification.requestPermission()
          if (permission !== 'granted') {
            shouldNotify.checked = false
          }
        }
      }
      setCache({notify: shouldNotify.checked})
    })
  } else {
    notifyDiv.style.visibility = 'hidden'
  }
}

const once = () => {
  attachToForm()
  attachOptions()
  attachNavigation()
  attachNotify()
  localStorage.removeItem('year')
  localStorage.removeItem('cache')
}

// consider merge into getTimetable
const fetchAndParseTimetable = async (url) => {
  const clean = (text) =>
    text
      .replace(/\&nbsp;/g, '')
      .replace(/;;+/g, '')
      .replace(/"/g, '\'')
      .trim()

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Can\'t fetch timetable')
  }
  const text = await response.text()

  const parser = new DOMParser()
  const root = parser.parseFromString(text, 'text/html').body
  const timetableElements = Array.from(
    root.querySelectorAll('table.spreadsheet')
  )

  let date = false;
  const dateMatch = /^(\d+) ([a-zA-Z]+) (\d+)$/;
  const dateElement = root.getElementsByClassName("header-3-0-22")[0];
  const dateString = dateElement.innerText;
  // check if a date is specified (only appears in week view)
  if (dateMatch.exec(dateString)) {
    date = new Date(dateString)
  }

  const toClass = ({info, dayIndex}) => {
    const extractLink = (text) => {
      const match = text.match(/.*href='([^']*).*/)
      return match ? encodeURI(match[1]) : ''
    }

    const extractTime = (text) => Number(text.split(':')[0])

    const commafy = (text) => text.replace(/;/g, ', ')

    const link = extractLink(info[4].html)
    const alternativeTimesLink = link ? timetableLink + link.slice(1) : ''

    const days = info[9].text
      .split(', ')
      .flatMap((range) => {
        if (range.indexOf('-') !== -1) {
          const [start, end] = range.split('-').map(Number)
          return Array(end - start + 1)
            .fill()
            .map((_, i) => i + start)
        }
        return Number(range)
      })
      .map((week) => {
        if (week <= 11) {
          return week
        } else if (week <= 22) {
          return week + 4
        }
        return week + 8
      })
      .map((week) => week * 7 + dayIndex)

    const teacher = info[10].text
      .split(';')
      .map((name) =>
        name
          .split(',')
          .reverse()
          .map((el) => el.split(' ')[0])
          .filter((el) => el !== 'Dr' && el !== 'Prof')
          .join(' ')
      )
      .join(', ')

    const startHour = extractTime(info[7].text);
    const endHour = extractTime(info[8].text);

    const day = new Date(date);
    day.setDate(day.getDate() + dayIndex);

    const startDate = new Date(day);
    startDate.setHours(startHour);
    const endDate = new Date(day);
    endDate.setHours(endHour);

    return {
      code: commafy(info[0].text),
      title: commafy(info[1].text),
      type: info[2].text.split(';')[0],
      location: info[3].text,
      locationLink: extractLink(info[3].html),
      note: info[5].text,
      start: startHour,
      end: endHour,
      alternativeTimesLink,
      days,
      teacher,
      startDate,
      endDate,
    }
  }

  const classesInfo = timetableElements
    .map((el) =>
      Array.from(el.querySelectorAll('tr')).filter(
        (el) => el.className.indexOf('columnTitles') === -1
      )
    )
    .flatMap((timetableForDay, dayIndex) =>
      timetableForDay.map((el) => {
        const info = Array.from(el.children)
          .filter((el) => el.innerHTML)
          .map((el) => ({
            html: clean(el.innerHTML),
            text: clean(el.innerText),
          }))
        return {info, dayIndex}
      })
    )

  return classesInfo.map(toClass)
}

const getTimetable = async () => {
  const {
    identifier,
    cached,
    yearRange: cachedYearRange,
    timetable: cachedTimetable,
  } = getCache()
  const yearRange = toRange(getYear())
  if (!cached || yearRange !== cachedYearRange || !cachedTimetable) {
    const url = buildURL(identifier)
    const timetable = await fetchAndParseTimetable(url)
    return timetable
  }

  return cachedTimetable
}

const options = {
  start: 9,
  end: 19,
  show: 7,
  sliding: true,
  notifyBefore: 5,
  // sliding: false,
}

const getOffset = (date) => Math.floor((date - baseDate) / 1000 / 60 / 60 / 24)

let offset = 0
let lastHour = -1
let lastStart = -1
const haveColours = {}
const drawTimetable = (timetable) => {
  const now = getNow()

  const getColour = (code) => {
    if (!haveColours.hasOwnProperty(code)) {
      haveColours[code] = `hsl(${Math.round(Math.random() * 360)}, 50%, 75%)`
    }
    return haveColours[code]
  }

  const visibleRange = () => {
    const yearOffset = (getYear(now) - getYear(baseDate)) * 52 * 7
    const today = getOffset(now) - yearOffset
    const todayWeekday = now.getDay()

    const show = options.show
    const showEachSide = Math.floor(show / 2)

    let start = 0
    let startWeekday = 0
    let end = 0
    if (options.sliding || show !== 7) {
      start = today - showEachSide
      startWeekday = (todayWeekday - showEachSide + 7) % 7
      end = today + showEachSide
    } else {
      start = today - todayWeekday + 1
      startWeekday = 1
      end = start + show
    }
    start += offset * show
    end += offset * show
    return {
      start,
      startWeekday,
      todayOffset: (todayWeekday - startWeekday + 7) % 7,
    }
  }

  const setSize = () => {
    const {todayOffset} = visibleRange()
    const size =
      `--size: repeat(${todayOffset}, 1fr) 2fr ` +
      `repeat(${options.show - 1 - todayOffset}, 1fr)`
    const daysEl = document.querySelector('.days')
    const classesEl = document.querySelector('.classes')
    if (offset === 0) {
      daysEl.style = size
      classesEl.style = size
    } else {
      daysEl.style = ''
      classesEl.style = ''
    }
  }

  const drawDays = () => {
    const {start, todayOffset} = visibleRange()
    const dayDivs = Array.from(document.querySelectorAll('div.days div'))
    const dayParts = dayDivs.map((el) => Array.from(el.children))

    const startDate = new Date(
      now.getTime() - (todayOffset - offset * 7) * 1000 * 60 * 60 * 24
    )

    const dayText = Array(options.show)
      .fill()
      .map((_, i) => {
        const currentDay = new Date(
          startDate.getTime() + i * 1000 * 60 * 60 * 24
        )
        const day = STRINGS.days[currentDay.getDay()]
        const date = `${
          STRINGS.months[currentDay.getMonth()]
          } ${currentDay.getDate()}`
        return {day, date}
      })

    dayText.forEach(({day, date}, i) => {
      const [dayEl, dateEl] = dayParts[i]
      dayEl.textContent = day
      dateEl.textContent = date
    })
    dayDivs.map((el, i) => {
      const day = (start + i) % 7
      el.classList.remove('today')
      el.classList.remove('weekend')
      if (day >= 5) {
        el.classList.add('weekend')
      }
    })
    if (offset === 0) {
      dayDivs[todayOffset].classList.add('today')
    }
  }

  const drawTime = () => {
    const timeDivs = Array.from(document.querySelectorAll('div.times p'))
    const nowOffset = now.getHours() - options.start

    timeDivs.map((el) => el.classList.remove('now'))
    if (offset === 0 && 0 <= nowOffset && nowOffset < timeDivs.length) {
      timeDivs[nowOffset].classList.add('now')
    }
  }

  const drawLine = () => {
    const lineEl = document.querySelector('div.line')
    const nowTime = now.getHours() + now.getMinutes() / 60

    if (options.start <= nowTime && nowTime < options.end) {
      const percentage =
        (nowTime - options.start) / (options.end - options.start)
      lineEl.style.top = `${percentage * 100}%`
      lineEl.style.visibility = ''
    } else {
      lineEl.style.visibility = 'hidden'
    }
  }

  const drawClasses = () => {
    const make = (tag, {className, text, children = []}) => {
      const el = document.createElement(tag)
      if (className) {
        el.className = className
      }
      if (text) {
        el.textContent = text
      }
      children.forEach((child) => el.appendChild(child))
      return el
    }

    const toDiv = (classInfo) => {
      const location = make('a', {
        className: 'location',
        text: classInfo.location,
      })
      if (classInfo.locationLink) {
        location.target = '_blank'
        location.rel = 'noopener'
        location.href = classInfo.locationLink
      }

      const top = make('div', {className: 'top', children: [location]})

      if (classInfo.alternativeTimesLink) {
        const alternativeTimes = make('a', {
          className: 'alternative',
          text: 'Alt. times',
        })
        alternativeTimes.target = '_blank'
        alternativeTimes.rel = 'noopener'
        alternativeTimes.href = classInfo.alternativeTimesLink
        top.appendChild(alternativeTimes)
      }

      const name = make('p', {className: 'name', text: classInfo.title})
      const info = make('p', {
        className: 'info',
        text: `${classInfo.type}${
          classInfo.teacher ? ` - ${classInfo.teacher}` : ''
          }`,
      })
      const code = make('p', {className: 'code', text: classInfo.code})
      const div = make('div', {
        className: 'class',
        children: [top, name, info, code],
      })

      div.style = `grid-row: t${classInfo.start}-start / t${
        classInfo.end
        }-start; background: ${getColour(classInfo.code)}`

      div.dataset.start = classInfo.start
      div.dataset.end = classInfo.end

      return div
    }

    const {start, todayOffset} = visibleRange()
    const visible = timetable.filter((classInfo) =>
      classInfo.days.some((day) => start <= day && day <= start + options.show)
    )
    const visibleByDay = Array(options.show)
      .fill()
      .map((_, i) =>
        visible.filter((classInfo) => classInfo.days.includes(start + i))
      )
    const classDivs = Array.from(document.querySelectorAll('div.classes .day'))

    classDivs.forEach((div, i) => {
      div.classList.remove('today')
      if (offset === 0 && i === todayOffset) {
        div.classList.add('today')
      }
      if (start !== lastStart) {
        div.innerHTML = ''
      }
    })

    visibleByDay.map((classes, index) => {
      const classDiv = classDivs[index]
      classes.forEach((classInfo) => {
        if (start !== lastStart) {
          const div = toDiv(classInfo)
          classDiv.appendChild(div)
        }
      })
    })

    const nowHour = now.getHours()
    if (offset === 0) {
      Array.from(classDivs[todayOffset].children).forEach((div) => {
        div.classList.remove('now')
        if (div.dataset.start <= nowHour && nowHour < div.dataset.end) {
          div.classList.add('now')
        }
      })
    }
  }

  const nowHour = now.getHours()
  const {start} = visibleRange()
  if (nowHour !== lastHour || start !== lastStart) {
    setSize()
    drawDays()
    drawTime()
    drawClasses()
    lastHour = nowHour
    lastStart = start
  }
  drawLine()
}

const notify = async ({classInfo, timeTo}) => {
  const reg = await navigator.serviceWorker.getRegistration()
  const tag = `${classInfo.code}@${classInfo.start}`

  const title = `${classInfo.code} starts in ${timeTo} minute${
    timeTo === 1 ? '' : 's'
    }`
  const options = {
    tag,
    body: classInfo.location
      ? `Head to ${classInfo.location}`
      : 'No location given',
    badge: 'icons/badge.png',
    icon: 'icons/android-chrome-512x512.png',
    data: {
      url: window.location.href,
      location: classInfo.locationLink,
    },
  }

  if (timeTo > 0) {
    console.log(`Notifying ${tag} ${timeTo}`)
    if (reg.showNotificationa) {
      options.actions = [
        {
          action: 'location',
          title: 'Where\'s that?',
          icon: 'svg/location.svg',
        },
      ]
      reg.showNotification(title, options)
    } else {
      const not = new Notification(title, options)
      setTimeout(() => not.close(), 5000)
    }
  }
}

const getNext = (timetable) => {
  const getTimeTo = (classInfo) => Math.round((classInfo.start - nowTime) * 60)

  const now = getNow()
  const nowTime = now.getHours() + now.getMinutes() / 60
  const yearOffset = (getYear(now) - getYear(baseDate)) * 52 * 7
  const today = getOffset(now) - yearOffset

  const nextClass = timetable
    .filter((classInfo) => classInfo.days.includes(today))
    .map((classInfo) => ({classInfo, timeTo: getTimeTo(classInfo)}))
    .filter(({timeTo}) => 0 <= timeTo && timeTo <= options.notifyBefore)

  return nextClass
}

const notifyNext = (timetable) => {
  const nextClasses = getNext(timetable)
  if (nextClasses) {
    nextClasses.map(notify)
  }
}

const go = async () => {
  const {identifier} = getCache()
  if (identifier) {
    document.body.classList.remove('noInfo')
    try {
      const timetable = await getTimetable()
      setCache({cached: true, yearRange: toRange(getYear()), timetable})
      try {
        notifyNext(timetable)
        drawTimetable(timetable)
        setInterval(() => drawTimetable(timetable), 100)
        setInterval(() => notifyNext(timetable), 1000)

        requestAnimationFrame(() => {
          setTimeout(goToToday, 100)
        })
      } catch (e) {
        console.error(e)
      }
    } catch (e) {
      console.error(e)
      document.body.classList.add('noInfo')
      alert('There was a problem fetching your timetable, please try again')
    }
  } else {
    document.body.classList.add('noInfo')
  }
}

const mount = async () => {
  try {
    if ('serviceWorker' in navigator) {
      await navigator.serviceWorker.register('cs30.js')
    }
  } catch ({message}) {
    console.error(message)
  }
}

mount()

once()
go()

const goToToday = () => {
  const today = document.querySelector('.day.today')
  const now = document.querySelector('.class.now')
  if (today) {
    today.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'end',
    })
  } else if (now) {
    now.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'end',
    })
  }
}

window.addEventListener('resize', goToToday, {passive: true})
