const base = "http://timetable.leeds.ac.uk/teaching/201819/reporting"
const nextClassMinutes = 5

const link = document.querySelector("input#link")
const retrieve = document.querySelector("form")

const options = document.querySelector(".options")
const update = options.querySelector(".update")
const dim = options.querySelector(".dim")
const grid = document.querySelector(".classes").children
const days = Array.from(document.querySelectorAll(".days div"))
const dayParts = (el) => [el.querySelector(".day"), el.querySelector(".date")]
const times = Array.from(document.querySelector(".times").children)
const line = document.querySelector(".line")

const prev = document.querySelector(".prev")
const next = document.querySelector(".next")

let nowClasses
let nextClasses

const notifyCheckbox = document.querySelector(".notifications input")

let shouldNotify = notifyCheckbox.checked

let alreadyNotified = {}

let weekOffset = 0

const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
]

const haveColors = {}

let weekDraw
let drawInterval
let lastDate = undefined

const getClasses = table => Array.from(
  table.querySelectorAll("tbody tr:not(.columnTitles)")
)

const getAllInfo = classes => classes.map(singleClass => {
  return Array.from(singleClass.cells)
    .map(cell => cell.innerHTML)
})

const parseType = (type) => type.match(/^([\w]+).*?(\d)?$/)[1].toLowerCase()

const parseTime = (time) => time.split(":").join("")

const parseWeeks = (weeks) => weeks.split(", ").reduce(
  (full, weekRange) => {
    if (weekRange.indexOf("-") !== -1) {
      const [start, end] = weekRange.split("-").map(Number)
      const range = Array(end - start + 1)
        .fill()
        .map((_, i) =>
          start + i
        )
      return full.concat(range)
    } else {
      return full.concat(Number(weekRange))
    }
  }, [])

const shiftWeeks = (weeks) => weeks.map(
  weekNumber => {
    if (weekNumber <= 11) {
      return weekNumber
    } else if (weekNumber <= 22) {
      return weekNumber + 4
    } else {
      return weekNumber + 8
    }
  })

const parseDays = (weekday, weeks) => weeks.map(weekNumber => weekNumber * 7 + weekday)

const getContent = (text) => {
  let el = document.createElement("span")
  el.innerHTML = text
  return el.innerText.replace(/\s/g, ' ')
}

const getLink = (text) => {
  const match = text.match(/href="([^"]*)/)
  if (!match) {
    return undefined
  } else {
    return match[1]
  }
}

const getHasAlternate = (text) => {
  text = getContent(text).replace(/\s/g, '')

  if (text == "") {
    return false
  } else {
    if (text == ";") {
      return false
    } else {
      return text
    }
  }
}

const getAlternateLink = (text) => {
  let url = getLink(text)
  if (url) {
    url = url.slice(1).replace(/&amp;/g, '&')
  }
  return url
}

const getInfo = (classes, weekday) => classes.map(classInfo => ({
  code: getContent(classInfo[0]),
  name: getContent(classInfo[0]).length > 8 ? getContent(classInfo[0]) : classInfo[1],
  teacher: getContent(classInfo[10]),
  type: classInfo[2],
  typeShort: parseType(classInfo[2]),
  location: getContent(classInfo[3]),
  locationLink: getLink(classInfo[3]),
  timeBegin: parseTime(classInfo[7]),
  timeEnd: parseTime(classInfo[8]),
  days: parseDays(weekday, shiftWeeks(parseWeeks(classInfo[9]))),
  alternate: getHasAlternate(classInfo[4]),
  alternateLink: getAlternateLink(classInfo[4])
}))

const getTimetable = async (url) => {
  let rawHTML = localStorage.getItem("cache")

  if (!rawHTML) {
    if (url) {
      rawResponse = await fetch(url)
      if (rawResponse.ok) {
        localStorage.setItem("identifier", getIdentifier(url))
        rawHTML = await rawResponse.text()
      } else {
        localStorage.setItem("identifier", "")
        alert("400 error, check that the link works")
        return [[], []]
      }
      localStorage.setItem("cache", rawHTML)
    } else {
      alert("Copy timetable link from Student Services into the box at the bottom\nLooks like http://timetable.leeds.ac.uk/...")
      return [[], []]
    }
  }

  const parser = new DOMParser()
  const body = parser.parseFromString(rawHTML, "text/html").body

  const classTables = Array.from(
    body.querySelectorAll("table.spreadsheet")
  )
  const classesByDay = classTables
    .map(getClasses)
    .map(getAllInfo)
    .map(getInfo)

  const classes = classesByDay.reduce((full, day) => full.concat(day), [])
  return [classesByDay, classes]
}

const getCORS = (identifier) => `https://cors-anywhere.herokuapp.com/${base}/textspreadsheet;?objectclass=student+set&idtype=id&identifier=${identifier}&template=SWSCUST+Student+Set+Individual+semester&days=1-7&periods=1-21&weeks=1-44`

const getIdentifier = (url) => {
  let match = url.match(/(?:.*identifier=)(\d+)(?:.*)/)
  if (match) {
    return match[1]
  } else {
    return undefined
  }
}

const getColor = (course) => {
  if (!haveColors.hasOwnProperty(course)) {
    haveColors[course] = `hsl(${Math.round(Math.random() * 360)}, 50%, 75%)`
  }
  return haveColors[course]
}

const showClass = (dayIndex) => (singleClass, classIndex) => {
  let classDiv = document.createElement("div")
  classDiv.className = "class"
  classDiv.style = `grid-row: t${singleClass.timeBegin}-start / t${singleClass.timeEnd}-start; background: ${getColor(singleClass.code)};`

  let classDivTop = document.createElement("div")
  classDivTop.className = "top"
  classDiv.appendChild(classDivTop)

  let classDivLocationA = document.createElement("a")
  classDivLocationA.className = "location"
  if (singleClass.locationLink) {
    classDivLocationA.classList.add("linked")
    classDivLocationA.href = singleClass.locationLink
    classDivLocationA.target = '_blank'
  }
  classDivLocationA.textContent = singleClass.location
  classDivTop.appendChild(classDivLocationA)

  let classDivNameP = document.createElement("p")
  classDivNameP.className = "name"
  classDivNameP.textContent = singleClass.name
  classDiv.appendChild(classDivNameP)

  let classDivTypeP = document.createElement("p")
  classDivTypeP.className = "info"
  classDivTypeP.textContent = `${singleClass.type} - ${singleClass.teacher}`
  classDiv.appendChild(classDivTypeP)

  let classDivCodeP = document.createElement("p")
  classDivCodeP.className = "code"
  classDivCodeP.textContent = singleClass.code
  classDiv.appendChild(classDivCodeP)

  if (singleClass.alternate) {
    let classDivAlternateA = document.createElement("a")
    classDivAlternateA.className = "alternate"
    classDivAlternateA.href = `${base}${singleClass.alternateLink}`
    classDivAlternateA.target = '_blank'
    classDivTop.appendChild(classDivAlternateA)
  }

  grid[dayIndex].appendChild(classDiv)

  singleClass.div = classDiv
}

const showClasses = (classes, dayIndex) => {
  classes.map(showClass(dayIndex))
}

const time = (now) => Math.floor(now.getHours() * 100 + now.getMinutes() * 5 / 3)

const isNow = (now) => (singleClass) => weekOffset === 0 && Number(singleClass.timeBegin) <= time(now) && time(now) < Number(singleClass.timeEnd)

const isNext = (now) => (singleClass) => {
  const then = new Date(now)
  then.setMinutes(now.getMinutes() + nextClassMinutes)
  return weekOffset === 0 && Number(singleClass.timeBegin) == time(then)
}

const clearClasses = () => {
  Array.from(grid).map(div => {
    if (!div.classList.contains("line")) {
      const copy = div.cloneNode(false)
      div.parentNode.replaceChild(copy, div)
    }
  })
}

const showDays = (periodDays, today) => {
  days.map((el, dayIndex) => {
    let [day, date] = dayParts(el)
    day.textContent = periodDays[dayIndex][0]
    date.textContent = periodDays[dayIndex][1]
    if (dayIndex == 5 || dayIndex == 6) {
      el.classList.add("weekend")
    } else {
      el.classList.remove("weekend")
    }
  })
  const daysEl = document.querySelector(".days")
  const gridEl = document.querySelector(".classes")
  const weekDay = getWeekDayNumber(today)
  if (weekOffset === 0) {
    days[weekDay].classList.add("today")
    grid[weekDay].classList.add("today")
    let size = `--size: ${weekDay ? `repeat(${weekDay}, 1fr) ` : ''}2fr${6 - weekDay ? ` repeat(${6 - weekDay}, 1fr)` : ''}`
    daysEl.style = size
    gridEl.style = size
  } else {
    days[weekDay].classList.remove("today")
    grid[weekDay].classList.remove("today")
    daysEl.removeAttribute('style')
    gridEl.removeAttribute('style')
  }
}

const getDayNumber = (date) => {
  const local = new Date(date.getTime())
  local.setHours(12)
  const diff = local - new Date(2018, 8, 24)
  const diffDays = Math.floor(diff / 1000 / 60 / 60 / 24)
  return diffDays
}

const getWeekNumber = (date) => Math.floor(getDayNumber(date) / 7) * 7

const getWeekDayNumber = (date) => getDayNumber(date) - getWeekNumber(date)

const getClassesForDayNumber = (dayNumber) => (singleClass) => singleClass.days.indexOf(dayNumber) !== -1

const getClassesForWeek = (allClasses, weekNumber) => {
  let classesForPeriod = []
  let periodDays = []
  for (let i = 0; i < 7; ++i) {
    let checkDay = weekNumber + i
    classesForPeriod.push(allClasses.filter(getClassesForDayNumber(checkDay)))
    let d = new Date(2018, 8, 24)
    d.setDate(d.getDate() + checkDay)
    periodDays.push([`${dayNames[(checkDay + 7) % 7]}`, `${monthNames[d.getMonth()]} ${d.getDate()}`])
  }
  return [classesForPeriod, periodDays]
}

const drawDays = (allClasses, now) => {
  const [classes, days] = getClassesForWeek(allClasses, getWeekNumber(now))
  clearClasses()
  classes.map(showClasses)
  showDays(days, now)
}

const drawNow = (allClasses, now) => {
  let shiftedHour = now.getHours() - 9
  let oldClasses = Array.from(document.querySelectorAll(".class.now"))

  let lastTimeDiv = times.filter(time => time.classList.contains("now"))[0]

  if (times[shiftedHour]) {
    if (!times[shiftedHour].classList.contains("now")) {
      if (lastTimeDiv && lastTimeDiv !== times[shiftedHour]) {
        lastTimeDiv.removeAttribute("class")
      }
      times[shiftedHour].classList.add("now")
    }
  }

  const today = getDayNumber(now)
  const [classes, days] = getClassesForWeek(allClasses, getWeekNumber(now))

  let nowClasses = []

  if (allClasses.length !== 0) {
    nowClasses = classes[getWeekDayNumber(now)].filter(isNow(now))
    let nowDivs = nowClasses.map(singleClass => singleClass.div)
    if (oldClasses[0] !== nowClasses[0]) {
      oldClasses.forEach(singleDiv => singleDiv.classList.remove("now"))
    }
    nowDivs.forEach(singleDiv => singleDiv.classList.add("now"))
  }

  return classes[0]
}

const draw = (classes) => (initial = false) => {
  // const now = new Date(2019, 2, 5, 12, 00)
  const now = new Date()
  now.setDate(now.getDate() + weekOffset * 7)
  const shiftedHour = now.getHours() - 9

  if (initial || !lastDate) {
    if (classes.length !== 0) {
      lastDate = new Date(now)
      drawDays(classes, now)
      drawNow(classes, now)
    } else {
      drawDays([], now)
      drawNow([], now)
    }
  }

  if (lastDate && lastDate.getDate() !== now.getDate()) {
    lastDate.setDate(now.getDate())
    drawDays(classes, now)
  }

  if (shiftedHour >= 0 && shiftedHour < 10) {
    if (lastDate && lastDate.getMinutes() !== now.getMinutes()) {
      lastDate.setHours(now.getHours())

      drawNow(classes, now)
    }

    line.style.visibility = ""

    line.style.top = `${(time(now) - 900) / 10}%`
  } else {
    line.style.visibility = "hidden"
    Array.from(times).forEach(time => time.classList.remove("now"))
  }

  const classesToday = getClassesForWeek(classes, getWeekNumber(now))[0][getWeekDayNumber(now)]
  nowClasses = classesToday.filter(isNow(now))
  nextClasses = classesToday.filter(isNext(now))
}

/* BUILD */

const buildTimetable = async (url) => {
  try {
    const [classesByDay, classes] = await getTimetable(url)

    clearInterval(drawInterval)
    weekDraw = draw(classes)
    drawInterval = setInterval(weekDraw, 50)
    weekDraw(true)
  } catch (e) {
    console.error(e)
  }
}

const mount = async () => {
  try {
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register("cs30.js")
    }
  } catch ({ message }) {
    console.error(message)
  }
}

const checkMode = () => {
  const mode = localStorage.getItem("mode")
  const themeColor = document.head.querySelector("meta[name=\"theme-color\"]")

  if (mode === "dark") {
    document.body.classList.add("dark")
  } else {
    document.body.classList.remove("dark")
  }
  themeColor.content = getComputedStyle(document.body).getPropertyValue("--background")
}

retrieve.addEventListener("submit", (e) => {
  e.preventDefault()
  if (!link.value) {
    alert("Please copy timetable link from Student Services into this box\nLooks like http://timetable.leeds.ac.uk/...")
  } else {
    let identifier = getIdentifier(link.value)
    if (identifier) {
      let url = getCORS(identifier)

      clearClasses()
      clearInterval(drawInterval)
      weekDraw = draw([])
      drawInterval = setInterval(weekDraw, 50)
      weekDraw(true)

      localStorage.removeItem("cache")
      buildTimetable(url)
    } else {
      alert("Invalid link or identifier parameter not set")
    }
  }
})

update.addEventListener("click", async (e) => {
  options.classList.add("updating")
  const identifier = localStorage.getItem("identifier")
  if (!identifier) {
    options.classList.remove("updating")
    return alert("Please copy timetable link from Student Services into the box at the bottom\nLooks like http://timetable.leeds.ac.uk/...")
  }
  if (!navigator.onLine) {
    options.classList.remove("updating")
    return alert("Network is offline")
  } else {
    let url = getCORS(identifier)
    localStorage.removeItem("cache")
    await buildTimetable(url)
    options.classList.remove("updating")
  }
})

dim.addEventListener("click", (e) => {
  if (document.body.classList.contains("dark")) {
    localStorage.setItem("mode", "")
  } else {
    localStorage.setItem("mode", "dark")
  }
  checkMode()
})

prev.addEventListener("click", () => {
  weekOffset -= 1
  lastDate = undefined
})

next.addEventListener("click", () => {
  weekOffset += 1
  lastDate = undefined
})

const checkForPermission = async () => {
  if (!("Notification" in window)) {
    return console.log("Notifications are not supported in this browser")
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
  }
}

const attachNotifier = () => {
  if (JSON.stringify(nextClasses) != JSON.stringify(nowClasses)) {
    nextClasses.forEach(notify)
  }
}

const checkNotify = () => {
  if ("Notification" in window && navigator.serviceWorker) {
    notifyCheckbox.addEventListener("click", () => {
      shouldNotify = notifyCheckbox.checked
      localStorage.setItem("shouldNotify", shouldNotify)
    })

    shouldNotify = localStorage.getItem("shouldNotify") !== "false"

    notifyCheckbox.checked = shouldNotify

    setInterval(attachNotifier, 500)
  } else {
    notifyCheckbox.parentElement.className = "notifications not supported"
  }
}

const notify = async (singleClass) => {
  if ("Notification" in window) {
    if (Notification.permission === "granted" && shouldNotify) {
      const reg = await navigator.serviceWorker.getRegistration()

      const tag = `${singleClass.code}${singleClass.timeBegin}`

      if (alreadyNotified[tag] !== true) {
        console.log(`Notifying ${tag}`)
        reg.showNotification(`${singleClass.name} starts in ${nextClassMinutes} minutes`, {
          tag,
          body: singleClass.location.length > 2 ? `Head to ${singleClass.location}` : `No location given`,
          badge: "icons/badge.png",
          icon: "icons/android-chrome-512x512.png",
          data: {
            url: window.location.href
          },
          // renotify: true
        })

        alreadyNotified[tag] = true
      }
    }
  }
}

setInterval(() => {
  alreadyNotified = []
}, 60000)

checkMode()
buildTimetable()
mount()

checkForPermission()
checkNotify()

const goToday = () => {
  const today = document.querySelector(".day.today")

  if (today) {
    document.querySelector(".day.today").scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "end"
    })
  }
}

window.addEventListener("resize", goToday)
setTimeout(goToday, 250)