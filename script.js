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
      return weekNumber + 6
    } else if (weekNumber <= 22) {
      return weekNumber + 10
    } else {
      return weekNumber + 14
    }
  })

const getInfo = (classes, weekday) => classes.map(classInfo => ({
  code: classInfo[0],
  name: classInfo[1],
  type: classInfo[2],
  typeShort: parseType(classInfo[2]),
  location: classInfo[3],
  timeBegin: parseTime(classInfo[7]),
  timeEnd: parseTime(classInfo[8]),
  weekday,
  weeks: shiftWeeks(parseWeeks(classInfo[9]))
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

retrieve.addEventListener("submit", (e) => {
  e.preventDefault()
  if (!link.value) {
    alert("Please paste the link to your timetable in the box")
  } else {
    let identifier = getIdentifier(link.value)
    if (identifier) {
      let url = getCORS(identifier)
      clearInterval(drawInterval)
      weekDraw = draw([])
      drawInterval = setInterval(weekDraw, 50)
      weekDraw()
      Array.from(grid).map(day => {
        if (!day.classList.contains("line")) {
          let copy = day.cloneNode(false)
          day.parentNode.replaceChild(copy, day)
        }
      })
      localStorage.removeItem("cache")
      buildTimetable(url)
    } else {
      alert("Invalid link or identifier parameter not set")
    }
  }
})

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

  let classDivCourseP = document.createElement("p")
  classDivCourseP.className = "code"
  classDivCourseP.textContent = singleClass.code
  classDiv.appendChild(classDivCourseP)

  let classDivTypeP = document.createElement("p")
  classDivTypeP.className = "name"
  classDivTypeP.textContent = singleClass.name
  classDiv.appendChild(classDivTypeP)

  grid[dayIndex].appendChild(classDiv)

  singleClass.div = classDiv
}

const showDay = (day, dayIndex) => {
  day.map(showClass(dayIndex))
}

const getCurrentWeekNumber = () => {
  const diff = new Date() - new Date(2018, 8, 24)
  const diffWeeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7)
  return 6 + diffWeeks + 1
}

const getClassesForCurrentWeek = (currentWeekNumber) => (classesOnDay) => classesOnDay.filter(
  singleClass => singleClass.weeks.indexOf(currentWeekNumber) !== -1
)

const draw = (classes) => () => {
  const now = new Date()
  const shiftedDay = (now.getDay() - 1 + 7) % 7
  const shiftedHour = now.getHours() - 9

  Array.from(justGrid.querySelectorAll(".today")).map(div => div.classList.remove("today"))
  Array.from(justDays.querySelectorAll(".today")).map(div => div.classList.remove("today"))
  Array.from(justTimes.querySelectorAll(".now")).map(div => div.classList.remove("now"))

  justDays.style.gridTemplateColumns = `${"0.5fr ".repeat(shiftedDay)}1fr ${"0.5fr ".repeat(6 - shiftedDay)}`
  justGrid.style.gridTemplateColumns = `${"0.5fr ".repeat(shiftedDay)}1fr ${"0.5fr ".repeat(6 - shiftedDay)}`

  grid[shiftedDay].classList.add("today")
  days[shiftedDay].classList.add("today")

  if (shiftedHour >= 0 && shiftedHour < 10) {
    line.style.visibility = ""
    times[shiftedHour].classList.add("now")

    const nowTime = () => Math.floor(now.getHours() * 100 + now.getMinutes() * 5 / 3)

    Array.from(document.querySelectorAll(".class.now")).map(div => div.classList.remove("now"))

    if (classes.length !== 0) {
      let nowClass = classes[shiftedDay].filter(singleClass =>
        Number(singleClass.timeBegin) <= nowTime() && nowTime() < Number(singleClass.timeEnd)
      ).map(singleClass => singleClass.div.classList.add("now"))
    }

    line.style.top = `${(nowTime() - 900) / 10}%`
  } else {
    line.style.visibility = "hidden"
  }
}

/* BUILD */

const buildTimetable = async (url) => {
  try {
    const [classesByDay, classes] = await getTimetable(url)
    const classesThisWeek = classesByDay.map(getClassesForCurrentWeek(getCurrentWeekNumber()))
    classesThisWeek.map(showDay)

    clearInterval(drawInterval)
    weekDraw = draw(classesThisWeek)
    drawInterval = setInterval(weekDraw, 50)
    weekDraw()
  } catch ({ message }) {
    console.error(message)
  }
}

buildTimetable()
