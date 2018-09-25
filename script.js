const dayNames = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday"
]

const getClasses = table => Array.from(
  Array.from(
    table.querySelectorAll("tbody tr:not(.columnTitles)")
  )
)

const getAllInfo = classes => classes.map(singleClass =>
  Array.from(singleClass.cells)
    .map(cell => cell.innerText)
)

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

const getInfo = (classes, weekday) => classes.map(classInfo => ({
  code: classInfo[0],
  name: classInfo[1],
  type: classInfo[2],
  typeShort: parseType(classInfo[2]),
  location: classInfo[3],
  timeBegin: parseTime(classInfo[7]),
  timeEnd: parseTime(classInfo[8]),
  days: parseDays(weekday, shiftWeeks(parseWeeks(classInfo[9])))
}))

const getTimetable = async (url) => {
  let rawHTML = localStorage.getItem("cache")

  if (!rawHTML) {
    if (url) {
      rawResponse = await fetch(url)
      if (rawResponse.ok) {
        rawHTML = await rawResponse.text()
      } else {
        alert("400 error, check that the link works")
        return [[], []]
      }
      localStorage.setItem("cache", rawHTML)
    } else {
      alert("Copy timetable link from Student Services into box at the bottom\nLooks like http://timetable.leeds.ac.uk/...")
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

const getCORS = (identifier) => `https://cors-anywhere.herokuapp.com/http://timetable.leeds.ac.uk/teaching/201819/reporting/textspreadsheet;?objectclass=student+set&idtype=id&identifier=${identifier}&template=SWSCUST+Student+Set+Individual+semester&days=1-7&periods=1-21&weeks=1-44`

let weekDraw
let drawInterval

const getIdentifier = (url) => {
  let match = url.match(/(?:.*identifier=)(\d+)(?:.*)/)
  if (match) {
    return match[1]
  } else {
    return undefined
  }
}

const link = document.querySelector("input#link")
const retrieve = document.querySelector("form")

const justGrid = document.querySelector(".classes")
const justDays = document.querySelector(".days")
const justTimes = document.querySelector(".times")

const grid = document.querySelector(".classes").children
const days = document.querySelector(".days").children
const times = document.querySelector(".times").children
const line = document.querySelector(".line")

const haveColors = {}

const getColor = (course) => {
  const randHex = () => Math.random() * 155 + 100

  if (!haveColors.hasOwnProperty(course)) {
    haveColors[course] = `rgb(${randHex()}, ${randHex()}, ${randHex()})`
  }
  return haveColors[course]
}

const showClass = (dayIndex) => (singleClass, classIndex) => {
  let classDiv = document.createElement("div")
  classDiv.className = "class"
  classDiv.style = `grid-row: t${singleClass.timeBegin}-start / t${singleClass.timeEnd}-start; background: ${getColor(singleClass.code)};`

  let classDivCodeP = document.createElement("p")
  classDivCodeP.className = "code"
  classDivCodeP.textContent = singleClass.code
  classDiv.appendChild(classDivCodeP)

  let classDivNameP = document.createElement("p")
  classDivNameP.className = "name"
  classDivNameP.textContent = singleClass.name
  classDiv.appendChild(classDivNameP)

  let classDivTypeP = document.createElement("p")
  classDivTypeP.className = "type"
  classDivTypeP.textContent = singleClass.type
  classDiv.appendChild(classDivTypeP)

  let classDivLocationP = document.createElement("p")
  classDivLocationP.className = "location"
  classDivLocationP.textContent = singleClass.location
  classDiv.appendChild(classDivLocationP)

  grid[dayIndex].appendChild(classDiv)

  singleClass.div = classDiv
}

const showClasses = (classes, dayIndex) => {
  classes.map(showClass(dayIndex))
}

const time = (now) => Math.floor(now.getHours() * 100 + now.getMinutes() * 5 / 3)

const isNow = (now) => (singleClass) => Number(singleClass.timeBegin) <= time(now) && time(now) < Number(singleClass.timeEnd)

const clearClasses = () => {
  Array.from(grid).map(div => {
    if (!div.classList.contains("line")) {
      const copy = div.cloneNode(false)
      div.parentNode.replaceChild(copy, div)
    }
  })
}

const showDays = (periodDays) => {
  Array.from(days).map((day, dayIndex) => {
    day.textContent = dayNames[periodDays[dayIndex]]
    if (periodDays[dayIndex] > 4) {
      day.classList.add("weekend")
    } else {
      day.classList.remove("weekend")
    }
  })
}

const getDayNumber = (date) => {
  const diff = date - new Date(2018, 8, 24)
  const diffDays = Math.floor(diff / 1000 / 60 / 60 / 24)
  return diffDays
}

const getClassesForDayNumber = (dayNumber) => (singleClass) => singleClass.days.indexOf(dayNumber) !== -1

const getClassesForPeriodAround = (allClasses, day) => {
  let classesForPeriod = []
  let periodDays = []
  for (let i = 0; i < 7; ++i) {
    let checkDay = day + i - 3
    classesForPeriod.push(allClasses.filter(getClassesForDayNumber(checkDay)))
    periodDays.push((checkDay + 7) % 7)
  }
  return [classesForPeriod, periodDays]
}

const drawDays = (allClasses, now) => {
  const today = getDayNumber(now)
  const [classes, days] = getClassesForPeriodAround(allClasses, today)
  clearClasses()
  classes.map(showClasses)
  showDays(days)
}

const drawNow = (allClasses, now) => {
  Array.from(document.querySelectorAll(".class.now")).map(div => div.classList.remove("now"))

  const today = getDayNumber(now)
  const [classes, days] = getClassesForPeriodAround(allClasses, today)
  if (classes.length !== 0) {
    let nowClass = classes[3].filter(isNow(now)).map(singleClass => singleClass.div.classList.add("now"))
  }
}

let lastDate = undefined

const draw = (classes) => () => {
  const now = new Date()
  const shiftedDay = (now.getDay() - 1 + 7) % 7
  const shiftedHour = now.getHours() - 9

  Array.from(justTimes.querySelectorAll(".now")).map(div => div.classList.remove("now"))

  if (!lastDate) {
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
    console.log("First run for new day")
    lastDate.setDate(now.getDate())

    drawDays(classes, now)
  }

  if (shiftedHour >= 0 && shiftedHour < 10) {
    if (lastDate && lastDate.getHours() !== now.getHours()) {
      console.log("First run for new hour")
      lastDate.setHours(now.getHours())

      drawNow(classes, now)
    }

    line.style.visibility = ""
    times[shiftedHour].classList.add("now")

    line.style.top = `${(time(now) - 900) / 10}%`
  } else {
    line.style.visibility = "hidden"
  }
}

/* BUILD */

const buildTimetable = async (url) => {
  try {
    const [classesByDay, classes] = await getTimetable(url)

    clearInterval(drawInterval)
    weekDraw = draw(classes)
    drawInterval = setInterval(weekDraw, 50)
    weekDraw()
  } catch (e) {
    console.error(e)
  }
}

const mount = async () => {
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.register("cs30.js")
    }
  } catch ({ message }) {
    console.error(message)
  }
}

retrieve.addEventListener("submit", (e) => {
  e.preventDefault()
  if (!link.value) {
    alert("Please paste the link to your timetable in the box")
  } else {
    let identifier = getIdentifier(link.value)
    if (identifier) {
      let url = getCORS(identifier)

      clearClasses()
      clearInterval(drawInterval)
      weekDraw = draw([])
      weekDraw()

      localStorage.removeItem("cache")
      buildTimetable(url)
    } else {
      alert("Invalid link or identifier parameter not set")
    }
  }
})

buildTimetable()
mount()