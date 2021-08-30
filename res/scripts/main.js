/* =======================
Date related variables
======================= */
const dayNames = [
  "Hétfő",
  "Kedd",
  "Szerda",
  "Csütörtök",
  "Péntek",
  "Szombat",
  "Vasárnap",
];
const germanWeekDays = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
];
const months = [
  "Január",
  "Február",
  "Március",
  "Április",
  "Május",
  "Június",
  "Július",
  "Augusztus",
  "Szeptember",
  "Október",
  "November",
  "December",
];

const date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
let day = date.getDay();
let totalWorkDays = 0;
let workdays = [];
let actionLog = [];
let workdaysBackup = [];

class Workday {
  constructor(date) {
    this.date = date;
    this.personholiday = [];
    this.eight = [];
    this.halften = [];
    this.isHoliday = false;
  }
  calculateMaxPersonsForEight(index) {
    if (index % 2 == 1) {
      return Math.round((persons.length - this.personholiday.length) / 2);
    }
    return Math.floor((persons.length - this.personholiday.length) / 2);
  }

  isItMax() {
    return this.eight.length >= this.calculateMaxPersonsForEight();
  }

  isAlreadyContains(person) {
    return (
      !this.personIsNotOnHoliday(person) || !this.personIsNotScheduled(person)
    );
  }

  personIsNotOnHoliday(person) {
    if (this.personholiday.length !== 0) {
      for (const p of this.personholiday) {
        if (p === person) {
          return false;
        }
      }
    }
    return true;
  }

  personIsNotScheduledForHalften(person) {
    if (this.halften.length !== 0) {
      for (const p of this.halften) {
        if (p === person) {
          return false;
        }
      }
    }
    return true;
  }

  personIsnotScheduledForEight(person) {
    if (this.eight.length !== 0) {
      for (const p of this.eight) {
        if (p === person) {
          return false;
        }
      }
    }
    return true;
  }

  personIsNotScheduled(person) {
    return (
      this.personIsnotScheduledForEight(person) &&
      this.personIsNotScheduledForHalften(person)
    );
  }
}

/* End of date relted variables */

/* =======================
HTML Elements
======================= */

/* DIVs */
const calendarDiv = document.querySelector("#calendar__body");
const summaryDiv = document.querySelector(".summary");
const containers = document.querySelectorAll(".modalcontainer");

/* Modals */
const modal = document.getElementById("myModal");
const editModal = document.getElementById("editModal");
const modalForm = document.querySelector(".modal__form");
const modalTitle = document.querySelector(".modal__title");

/* Select */
const typeSelect = document.querySelector("#typeSelect");
const personSelect = document.querySelector("#personSelect");
const whenSelect = document.querySelector("#whenSelect");
const personSelectGroup = document.querySelector(".modal__form-group--person");
const whenSelectGroup = document.querySelector(".modal__form-group--when");

/* Buttons */
const modalSaveBtn = document.querySelector("#btn-save-plus");
const editModalSaveBtn = document.querySelector("#btn-edit-save");
const leftBtn = document.querySelector("#left-arrow");
const rightBtn = document.querySelector("#right-arrow");
const closeButtons = document.querySelectorAll(".modal__close");
const printBtn = document.querySelector("#btn-print");
const partialBtn = document.querySelector("#btn-partial");
const resetBtn = document.querySelector("#btn-reset");
const startBtn = document.querySelector("#btn-start");

const titleMonth = document.querySelector(".calendar__title");
let calendarDivWorkdays;
let calendarDivSelectedDay;
/* End of HTML Elements */

/* =======================
Each person to be scheduled
======================= */
class Person {
  constructor(personName) {
    this.name = personName;
    this.eight = 0;
    this.halften = 0;
    this.personholiday = 0;
  }
}

let persons = [
  new Person("Heni"),
  new Person("Anita"),
  new Person("Marina"),
  new Person("Judit"),
  new Person("Orsi"),
];

let personsBackup = [];
/* End of persons */

/* =======================
Event listeners 
======================= */
document.addEventListener("keydown", keyPressed);
leftBtn.addEventListener("click", leftBtnClick);
rightBtn.addEventListener("click", rightBtnClick);
typeSelect.addEventListener("change", typeChanged);
modalSaveBtn.addEventListener("click", modalSaveBtnClick);
editModalSaveBtn.addEventListener("click", editSave);
resetBtn.addEventListener("click", resetBtnClick);
startBtn.addEventListener("click", startBtnClick);
partialBtn.addEventListener("click", partialReset);
printBtn.addEventListener("click", printSchedule);
closeButtons.forEach((closeButton) => {
  closeButton.addEventListener("click", closeModal);
});

containers.forEach((container) => {
  container.addEventListener("dragover", containerDragOver);
});

/**
 * Add the mouseover and mouseleave event listeners to all names
 */
function addEventListeners() {
  let spans = document.querySelectorAll(".name");
  for (let span of spans) {
    span.addEventListener("mouseover", (e) => {
      highlightName(e);
    });
    span.addEventListener("mouseleave", (e) => {
      removeHighlight(e);
    });
  }
}

/**
 * Decreases current date by 1 month and re-render the page.
 */
function leftBtnClick() {
  month -= 1;
  if (month < 0) {
    year -= 1;
    month = 11;
  }
  setTimeout(() => {
    reset();
    render();
  }, 500);
  calendarDiv.classList.add("animate--right");
  setTimeout(() => {
    calendarDiv.classList.remove("animate--right");
  }, 1000);
}

/**
 * Increases current date by 1 month and re-render the page.
 */
function rightBtnClick() {
  month += 1;
  if (month > 11) {
    year += 1;
    month = 0;
  }
  setTimeout(() => {
    reset();
    render();
  }, 500);
  calendarDiv.classList.add("animate--left");
  setTimeout(() => {
    calendarDiv.classList.remove("animate--left");
  }, 1000);
}

/**
 * Displays or hide personSelectGroup and whenSelectgroup in the Modal based on typeSelect's value.
 */
function typeChanged() {
  if (typeSelect.options[typeSelect.selectedIndex].value == "personholiday") {
    personSelectGroup.classList.remove("hidden");
    whenSelectGroup.classList.add("hidden");
  } else if (typeSelect.options[typeSelect.selectedIndex].value == "request") {
    personSelectGroup.classList.remove("hidden");
    whenSelectGroup.classList.remove("hidden");
  } else {
    personSelectGroup.classList.add("hidden");
    whenSelectGroup.classList.add("hidden");
  }
}

/**
 * Marks the selected day as holiday and update the UI accordingly.
 */
function addHoliday() {
  calendarDivSelectedDay.classList.add("calendar__holiday");
  calendarDivSelectedDay.innerHTML = `<i class="fas fa-grin-beam"></i>`;
  calendarDivSelectedDay.classList.remove("calendar__selectable");
  for (const workday of workdays) {
    if (workday.date == calendarDivSelectedDay.dataset.day) {
      workday.isHoliday = true;
      break;
    }
  }
  totalWorkDays -= 1;
}

/**
 * Increases the selected person's holiday count by 1 and display it's name on the UI.
 */
function addPersonHoliday() {
  let selectedPerson = persons.filter(
    (person) =>
      person.name === personSelect.options[personSelect.selectedIndex].value
  )[0];
  for (const workday of workdays) {
    if (workday.date == calendarDivSelectedDay.dataset.day) {
      workday.personholiday.push(selectedPerson);
      actionLog.push([workday, selectedPerson, "holiday"]);
      selectedPerson.personholiday += 1;
      selectedPerson.eight += 1;
      refreshCalendar(true);
      return;
    }
  }
}

/**
 * Adds the person's request and update the UI.
 */
function addRequest() {
  let requestType = whenSelect.options[whenSelect.selectedIndex].value;
  let selectedPerson = personSelect.options[personSelect.selectedIndex].value;
  let person = persons.filter((person) => person.name === selectedPerson)[0];

  for (const workday of workdays) {
    if (workday.date == calendarDivSelectedDay.dataset.day) {
      if (requestType == 8) {
        person.eight++;
        workday.eight.push(person);
        actionLog.push([workday, person, "eight"]);
        calendarDivSelectedDay
          .querySelector(".calendar__800")
          .insertAdjacentHTML(
            "beforeend",
            createSpan(person, workday.date, true)
          );
      } else {
        workday.halften.push(person);
        actionLog.push([workday, person, "halften"]);
        calendarDivSelectedDay
          .querySelector(".calendar__930")
          .insertAdjacentHTML(
            "beforeend",
            createSpan(person, workday.date, true)
          );
      }
      return;
    }
  }
  addEventListeners();
}

/**
 * Calls the correct function based on typeSelect's value and close the modal.
 * @param {Event} event - The event
 */
function modalSaveBtnClick(event) {
  event.preventDefault();
  let type = typeSelect.options[typeSelect.selectedIndex].value;
  partialBtn.disabled = false;

  if (type == "holiday") {
    addHoliday();
  } else if (type == "personholiday") {
    addPersonHoliday();
  } else if (type == "request") {
    addRequest();
  }
  closeModal();
}

/**
 * Highlights the selected names
 * @param {Event} event - Event
 */
function highlightName(event) {
  let spans = document.querySelectorAll(".name");
  let rows = document.querySelectorAll(".summary-table__row");
  for (let span of spans) {
    if (span.dataset.name == event.target.dataset.name) {
      span.classList.add("highlight");
    }
  }
  for (let row of rows) {
    if (row.dataset.name == event.target.dataset.name) {
      row.classList.add("summary-table__row--highlight");
    }
  }
}

/**
 * Removes the highlight class from the given elements
 * @param {Event} event - Event
 */
function removeHighlight(event) {
  let spans = document.querySelectorAll(".name");
  let rows = document.querySelectorAll(".summary-table__row");
  for (let span of spans) {
    if (span.dataset.name == event.target.dataset.name) {
      span.classList.remove("highlight");
    }
  }
  for (let row of rows) {
    if (row.dataset.name == event.target.dataset.name) {
      row.classList.remove("summary-table__row--highlight");
    }
  }
}

/**
 * Reset button's event handler.
 */
function resetBtnClick() {
  reset();
  render();
}

function partialReset() {
  if (workdaysBackup.length > 0) {
    workdays = [];
    persons = [];
    persons = [...personsBackup];
    for (const workday of workdaysBackup) {
      workdays.push(Object.assign(new Workday(), { ...workday }));
    }
    workdaysBackup = [];
    personsBackup = [];
    actionLog = [];
  } else {
    if (actionLog.length > 0) {
      let action = actionLog[actionLog.length - 1];
      if (action[2] === "eight") {
        action[0].eight.pop();
        action[1].eight--;
      }
      if (action[2] === "halften") {
        action[0].halften.pop();
        action[1].halften--;
      }
      if (action[2] === "holiday") {
        action[0].personholiday.pop();
        action[1].personholiday--;
        action[1].eight--;
      }
      actionLog.pop();
    }
  }
  if (actionLog.length === 0) {
    partialBtn.disabled = true;
  }
  refreshCalendar(true);
  startBtn.disabled = false;
  summaryDiv.classList.add("hidden");
  printBtn.classList.add("hidden");

  typeSelect.options[0].disabled = false;
}

/**
 * Start button's event handler.
 */
function startBtnClick() {
  backUp();
  partialBtn.disabled = false;
  startBtn.disabled = true;
  printBtn.classList.remove("hidden");
  createSchedule();
  refreshCalendar();
  showSummary();
}

/**
 * Puts the HTML element to the right place within the container when the drag is over.
 * @param {Event} event - Event
 */
function containerDragOver(event) {
  event.preventDefault();
  const afterElement = getDragAfterElement(this, event.clientX);
  const draggable = document.querySelector(".dragging");
  if (afterElement == null) {
    this.appendChild(draggable);
  } else {
    this.insertBefore(draggable, afterElement);
  }
}

function keyPressed(event) {
  if (event.keyCode === 90) {
    partialReset();
  }
  if (event.keyCode === 13) {
    startBtnClick();
  }
}

function cellClicked(event) {
  calendarDivSelectedDay = event.currentTarget;
  showModal(event.currentTarget.dataset.day);
}

/* End of event listeners */

/* =======================
Data functions
======================= */
/**
 * Creates a back up of the workdays and persons arrays.
 */
function backUp() {
  workdaysBackup = JSON.parse(JSON.stringify(workdays));
  personsBackup = JSON.parse(JSON.stringify(persons));
}

function editSave(data) {
  // TODO: implement this
  /* let date = editModal.querySelector('.date-data').value;
  let day = workdays.filter(workday => workday.date == date);

  let eightSpans = editModal.querySelectorAll('.modal__800 > .draggable');
  let halftenSpans = editModal.querySelectorAll('.modal__930 > .draggable');
  eightSpans.forEach(spanElement => {
    let p = persons.filter(person => person.name == spanElement.dataset.name);
    if (day[0].eight.filter(personObject => personObject.name == p[0].name).length == 0) {
      day[0].eight.push({name: p[0].name, isRequest: false});
      p.eight += 1;
    }
    if (day[0].halften.filter(personObject => personObject.name == p[0].name).length != 0) {
      day[0].halften = day[0].halften.filter(po => po.name != p[0].name);
    }
    refreshCalendar();
    showSummary();
  }) */
}

/**
 *
 * @param {Node} container - The HTML Node where the dragging happens
 * @param {Number} x - Coordinate on the X axis
 * @returns
 */
function getDragAfterElement(container, x) {
  const draggableElements = [
    ...container.querySelectorAll(".draggable:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = x - box.left - box.width / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

/**
 * Returns the number of days in a given month and year.
 * @param {number} month - Month
 * @param {number} year - Year
 */
function getDaysInMonth(month, year) {
  return new Date(year, month - 1, 0).getDate();
}

/**
 * Gets day number from 0 (monday) to 6 (sunday) but make Sunday (0) the last day
 * @param {Date} date - The date.
 */
function getDay(date) {
  let day = date.getDay();
  if (day == 0) day = 7; // make Sunday (0) the last day
  return day - 1;
}

/**
 * Returns true of the given day is weekend.
 * @param {Date} date - The date
 */
function isWeekend(date) {
  let weekday = getDay(date);
  return weekday % 7 == 6 || weekday % 7 == 5;
}

/**
 * Resets totalWorkdays to 0 and update it with the number of workdays in a given month and year.
 * @param {number} year - Year
 * @param {number} month - Month
 */
function getWorkDays(year, month) {
  totalWorkDays = 0;
  let d = new Date(year, month);
  let totalDays = new Date(year, month + 1, 0).getDate();

  for (let i = 1; i <= totalDays; i++) {
    if (!isWeekend(d)) {
      totalWorkDays += 1;
    }
    d.setDate(d.getDate() + 1);
  }
}

/**
 * Checks if the given date is already in workdays and add it if it's not.
 * @param {Date} date - Date
 */
function populateWorkdays(date) {
  for (let workday of workdays) {
    if (workday == date) {
      return;
    }
  }
  workdays.push(new Workday(date));
}

/**
 * Updates each persons' eight property by extracting the number of holidays from it.
 */
function updateEveryPersonInfo() {
  for (let person of persons) {
    person.eight = person.eight - person.personholiday;
  }
}

/**
 * Creates the schedule
 * @summary Loop through every workdays and randomly schedule every person for 8:00 or 9:30.
 */
function createSchedule() {
  let max = 1; // A helper variable which is increased by 1 every second loop.
  let index = 0;
  let filteredPersons = [];
  for (let workday of workdays) {
    if (workday.isHoliday) {
      continue;
    }
    const maxPersonCount = workday.calculateMaxPersonsForEight(index);
    filteredPersons = persons.filter(
      (person) => !workday.isAlreadyContains(person)
    );
    while (workday.eight.length < maxPersonCount) {
      let _count = 0;
      if (_count >= 1000000) {
        throw new Error("Infinite loop detected");
      }
      filteredPersons = persons.filter(
        (person) => !workday.isAlreadyContains(person)
      );
      let filtered = filteredPersons.filter((person) => person.eight < max);
      if (index % 2 == 1) {
        let previousDay = workdays[workdays.indexOf(workday) - 1];
        if (!previousDay.isHoliday) {
          filtered = filteredPersons.filter(
            (person) => !previousDay.personIsNotScheduledForHalften(person)
          );
        }
      }
      if (
        filtered.length < maxPersonCount &&
        filtered.length + workday.eight.length < maxPersonCount
      ) {
        let plusPerson = filteredPersons.filter(
          (person) => !filtered.includes(person)
        );
        let plusRandomPerson =
          plusPerson[Math.floor(Math.random() * plusPerson.length)];
        filtered.push(plusRandomPerson);
      }
      let randomPerson = filtered[Math.floor(Math.random() * filtered.length)];
      workday.eight.push(randomPerson);
      randomPerson.eight++;
      _count++;
    }

    let remainingPersons = filteredPersons.filter((person) =>
      workday.personIsNotScheduled(person)
    );
    workday.halften = workday.halften.concat(remainingPersons);
    workday.halften.forEach((person) => person.halften++);
    max = index % 2 == 1 ? (max += 1) : max;
    index++;
  }
}

/* End of data functions */

/* =======================
UI functions
======================= */

/**
 * Create HTML span element with the given data.
 * @param {Array} data - Array of persons
 */
function createSpan(person, date, isRequest = false) {
  return `<span class='name ${
    isRequest ? "request" : ""
  }' data-date=${date} data-name='${person.name}'>${person.name}</span>`;
}

/**
 * Updates the UI with the schedule.
 */
function refreshCalendar(isPartialRefresh = false) {
  for (const calendarDivWorkday of calendarDivWorkdays) {
    const eight = calendarDivWorkday.querySelector(".calendar__800");
    const halften = calendarDivWorkday.querySelector(".calendar__930");
    const holiday = calendarDivWorkday.querySelector(
      ".calendar__personholiday"
    );
    const currentDate = calendarDivWorkday.dataset.day;
    const spanElements = calendarDivWorkday.querySelectorAll(".name");
    const workdayToDisplay = workdays.filter(
      (workday) => workday.date === currentDate
    )[0];
    if (workdayToDisplay.isHoliday) {
      continue;
    }
    let names = [];

    if (isPartialRefresh) {
      eight.innerHTML = "";
      halften.innerHTML = "";
      holiday.innerHTML = "";
      for (const person of workdayToDisplay.eight) {
        eight.insertAdjacentHTML(
          "beforeend",
          createSpan(person, workdayToDisplay.date, true)
        );
      }
      for (const person of workdayToDisplay.halften) {
        halften.insertAdjacentHTML(
          "beforeend",
          createSpan(person, workdayToDisplay.date, true)
        );
      }

      calendarDivWorkday.classList.add("calendar__selectable");
      calendarDivWorkday.addEventListener("click", cellClicked);
    } else {
      spanElements.forEach((span) => names.push(span.innerText));
      for (const person of workdayToDisplay.eight) {
        if (!names.includes(person.name)) {
          eight.insertAdjacentHTML(
            "beforeend",
            createSpan(person, workdayToDisplay.date)
          );
        }
      }
      for (const person of workdayToDisplay.halften) {
        if (!names.includes(person.name)) {
          halften.insertAdjacentHTML(
            "beforeend",
            createSpan(person, workdayToDisplay.date)
          );
        }
      }
      calendarDivWorkday.classList.remove("calendar__selectable");
      calendarDivWorkday.query;
      calendarDivWorkday.removeEventListener("click", cellClicked);
      //TODO: calendarDivWorkday.classList.add("calendar__editable");
    }
    if (workdayToDisplay.personholiday.length > 0) {
      let textToDisplay = `<i class="fas fa-user-slash"></i> Szabadság: `;
      textToDisplay += workdayToDisplay.personholiday
        .map((person) => person.name)
        .join(", ");
      holiday.innerHTML = textToDisplay;
    }
  }
  addEventListeners();
}

/**
 * Resets everything.
 */
function reset() {
  workdays = [];
  workdaysBackup = [];
  personsBackup = [];
  startBtn.disabled = false;
  partialBtn.disabled = true;
  printBtn.classList.add("hidden");
  summaryDiv.classList.add("hidden");
  typeSelect.options[0].disabled = false;
  totalWorkDays = 0;
  for (let person of persons) {
    person.halften = 0;
    person.eight = 0;
    person.personholiday = 0;
  }
}

/**
 * Shows the summary table at the bottom.
 */
function showSummary() {
  updateEveryPersonInfo();
  summaryDiv.innerHTML = "";
  summaryDiv.insertAdjacentHTML(
    "beforeend",
    "<h3>Munkanapok száma: " + totalWorkDays + "</h3>"
  );
  summaryDiv.insertAdjacentHTML(
    "beforeend",
    "<p><strong>Eloszlás:</strong> </p>"
  );
  let table = `<table class='summary-table'>
                <thead>
                  <tr>
                    <th>&nbsp;</th>
                    <th>8:00</th>
                    <th>9:30</th>
                    <th>Szabadság</th>
                  </tr>
                </thead>
                <tbody>`;
  for (let person of persons) {
    let row = `<tr class='summary-table__row' data-name='${person.name}'>
      <td>${person.name}</td>
      <td>${person.eight}</td>
      <td>${person.halften}</td>
      <td>${person.personholiday} nap</td>
    </tr>`;
    table += row;
  }
  table += "</tbody></table>";
  summaryDiv.insertAdjacentHTML("beforeend", table);
  summaryDiv.classList.toggle("hidden");
}

/**
 * Returns the correct table cell for the given date and call populateWorkdays.
 * @param {Date} date - The date.
 */
function getCell(date) {
  let curDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
  let month =
    date.getMonth() + 1 < 10
      ? "0" + (date.getMonth() + 1)
      : date.getMonth() + 1;
  let realDate = `${month}-${day}`;

  if (!isWeekend(date)) {
    populateWorkdays(curDate);
    return `
    <div class='cell calendar__selectable' data-day=${curDate} data-realdate=${realDate} data-dayname=${
      dayNames[getDay(date)]
    }>
      <span class='calendar__plus-icon' data-day=${curDate}><i class='fas fa-plus'></i></span>
      <span class='calendar__edit-icon'><i class='fas fa-edit'></i></span>
      <div class='calendar__day'>
        <div class='calendar__personholiday'></div>
        <div class='calendar__800'></div>
        <div class='calendar__930'></div>
        <span class='calendar__daynumber'>${date.getDate()}</span>
      </div>
    </div>`;
  } else {
    return `
    <div class='cell calendar__weekend'>
      <div>
        <span class='calendar__daynumber'>${date.getDate()}</span>
      </div>
    </div>`;
  }
}

/**
 * Displays the modal.
 * @param {string} data - Date string e.g.: 2021-06-01
 */
function showModal(data) {
  let [year, month, day] = data.split("-");
  let workday = workdays.filter((workday) => workday.date == data)[0];
  let personsToSelect = persons.filter(
    (person) => !workday.isAlreadyContains(person)
  );
  resetModals();
  let personSelect = modal.querySelector("#personSelect");
  personSelect.innerHTML = "";
  for (const person of personsToSelect) {
    let option = document.createElement("OPTION");
    option.value = person.name;
    option.innerText = person.name;
    personSelect.appendChild(option);
  }
  let dayData = workdays
    .filter((workday) => workday.date == data)
    .map((day) => {
      return day.personholiday.length + day.eight.length + day.halften.length;
    });
  // Disable holiday option of the day already includes a person.
  if (dayData[0] != 0) {
    typeSelect.selectedIndex = 1;
    typeSelect.options[0].disabled = true;
    personSelectGroup.classList.toggle("hidden");
  }
  let title = year + ". " + months[month] + " " + day + ".";
  modalTitle.innerText = title;
  modal.classList.remove("fadeout");
  modal.classList.toggle("hidden");
}

function showEditModal(data) {
  let year, month, day;
  [year, month, day] = data.split("-");
  editModal.querySelector(".date-data").value = data;
  resetModals();
  let dayData = workdays.filter((workday) => workday.date == data);
  if (dayData[0] != 0) {
    let title = year + ". " + months[month] + " " + day + ".";
    editModal.querySelector(".modal__title").innerText = title;
    let eight = dayData[0].eight.map((personObject) => {
      return `<span draggable="true" data-name="${personObject.name}" class="draggable"><i class="fas fa-arrows-alt"></i> ${personObject.name}</span>`;
    });
    let halften = dayData[0].halften.map((personObject) => {
      return `<span draggable="true" data-name="${personObject.name}" class="draggable"><i class="fas fa-arrows-alt"></i> ${personObject.name}</span>`;
    });
    let holiday = dayData[0].personholiday.map((personObject) => {
      return `<div class="modal__holiday-name" data-name="${personObject.name}">${personObject.name}
                <span class='remove'><i class="far fa-times-circle"></i></span>
              </div>`;
    });

    editModal.querySelector(".modal__800").innerHTML = eight.join("");
    editModal.querySelector(".modal__930").innerHTML = halften.join("");
    editModal.querySelector(".modal__holiday-list").innerHTML =
      holiday.join("");
    const draggables = editModal.querySelectorAll(".draggable");
    const removeIcons = editModal.querySelectorAll(".remove");

    draggables.forEach((draggable) => {
      draggable.addEventListener("dragstart", () => {
        draggable.classList.add("dragging");
      });
      draggable.addEventListener("dragend", () => {
        draggable.classList.remove("dragging");
      });
      draggable.addEventListener(
        "touchmove",
        () => {
          draggable.classList.add("dragging");
        },
        { passive: true }
      );
      draggable.addEventListener("touchend", () => {
        draggable.classList.remove("dragging");
      });
    });

    removeIcons.forEach((removeIcon) => {
      removeIcon.addEventListener("click", removeHoliday);
    });
    editModal.style.display = "flex";
  }
}

function removeHoliday() {
  let name = this.parentElement.dataset.name;
  let date = editModal.querySelector(".date-data").value;
  let workday = workdays.filter((workday) => workday.date == date);
  let p = workday[0].personholiday.filter((person) => person.name == name);
  workday[0].personholiday = workday[0].personholiday.filter(
    (person) => person != p[0]
  );
  let newDraggable = document.createElement("SPAN");
  newDraggable.innerHTML = `<i class="fas fa-arrows-alt"></i> ${name}`;
  newDraggable.dataset.name = name;
  newDraggable.draggable = true;
  newDraggable.classList.add("draggable");
  editModal
    .querySelector(".modal__holiday-list")
    .removeChild(this.parentElement);
  editModal.querySelector(".modal__unscheduled").appendChild(newDraggable);
  newDraggable.addEventListener("dragstart", () => {
    newDraggable.classList.add("dragging");
  });

  newDraggable.addEventListener("dragend", () => {
    newDraggable.classList.remove("dragging");
  });
}

/**
 * Resets the modal.
 */
function resetModals() {
  modalForm.reset();
  personSelectGroup.classList.add("hidden");
  whenSelectGroup.classList.add("hidden");
}

/**
 * Closes the modal.
 */
function closeModal() {
  modal.classList.add("fadeout");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 500);
}

/**
 * Create the calendar table and render it to the UI.
 * @param {number} year - Year
 * @param {number} month - Month
 */
function createCalendar(year, month) {
  let dayCells = dayNames
    .map((day) => {
      return `<div class="cell--header">${day}</div>`;
    })
    .join("");
  let table = `
  <div class="calendar__table">
    <div class="cell--header"><i class="fas fa-clock"></i></div>
    ${dayCells}
  `;
  let d = new Date(year, month);
  table +=
    "<div class='cell cell--hours'><div class='calendar__day calendar__day--hours'><div class='calendar__day--half'>8:00</div><div class='calendar__day--half'>9:30</div></div></div>";

  // Add empty cells
  for (let i = 0; i < getDay(d); i++) {
    table +=
      "<div class='cell calendar__day--empty'><i class='fas fa-ban'></i></div>";
  }

  while (d.getMonth() == month) {
    table += getCell(d);

    // Add a new row if it's end of week
    if (getDay(d) % 7 == 6) {
      let next = new Date(year, month, d.getDate() + 1);
      if (next.getMonth() == month) {
        table += `<div class='cell cell--hours'>
                    <div class='calendar__day calendar__day--hours'>
                      <div class='calendar__day--half'>8:00</div>
                      <div class='calendar__day--half'>9:30</div>
                    </div>
                  </div>`;
      }
    }
    d.setDate(d.getDate() + 1);
  }

  // Add empty cells
  if (getDay(d) != 0) {
    for (let i = getDay(d); i < 7; i++) {
      table += `<div class='cell calendar__day--empty'>
                  <i class='fas fa-ban'></i>
                </div>`;
    }
  }

  table += "</div>";
  calendarDiv.innerHTML = table;
  calendarDivWorkdays = document.querySelectorAll(".calendar__selectable");

  calendarDivWorkdays.forEach((cd) => {
    cd.addEventListener("click", cellClicked);
    cd.querySelector(".calendar__edit-icon").addEventListener("click", () => {
      showEditModal(cd.dataset.day);
    });
  });
}

function createPrintSummary() {
  let summary = `<div class='summary'>
                  <table class='summary-table'>
                    <tr>
                      <td>&nbsp;</td>
                      <td>8:00</td>
                      <td>9:30</td>
                    <td>Ferien</td>
                    </tr>`;
  for (let person of persons) {
    summary += `<tr>
                  <td>${person.name}</td>
                  <td>${person.eight}</td>
                  <td>${person.halften}</td>
                  <td>${person.personholiday}</td>
                </tr>`;
  }
  summary += "</table></div>";
  return summary;
}

function createPrintTable() {
  let d = new Date(year, month);
  let content = `<div class='container'><table class='schedule'><thead><tr><th>&nbsp;</th><th><div>Montag</div></th><th><div>Dienstag</div></th>`;
  content += `<th><div>Mittwoch</div></th><th><div>Donnerstag</div></th><th><div>Freitag</div></th></tr></thead><tbody>`;

  let daterow = `<tr><td>&nbsp;</td>`;
  let schedulerow = `<tr><td><div class='hours'><div class='eight'>8:00-16:30</div><div class='halften'>9:30-18:00</div></div></td>`;
  while (isWeekend(d)) {
    d.setDate(d.getDate() + 1);
  }
  for (let i = 0; i < getDay(d); i++) {
    daterow += `<td><div class='date'>&nbsp;</div></td>`;
    schedulerow += `<td><div class='names'><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div></div><div class='names'><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div></div></td>`;
  }

  while (d.getMonth() == month) {
    let curDate = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

    // We want to show the date in a readable format.
    let displayDay = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    let displayMonth =
      d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth();
    let displayDate = `${displayDay}.${displayMonth}.${d.getFullYear()}`;

    let workday = workdays.filter((workday) => workday.date == curDate);
    let calendarDiv = [...calendarDivWorkdays].filter(
      (div) => div.dataset.day === curDate
    )[0];
    if (getDay(d) % 7 == 6) {
      daterow += "</tr>";
      schedulerow += "</tr>";
      content += daterow;
      content += schedulerow;
      daterow = `<tr><td>&nbsp;</td>`;
      schedulerow = `<tr><td><div class='hours'><div class='eight'>8:00-16:30</div><div class='halften'>9:30-18:00</div></div></td>`;
    }
    if (workday.length == 0) {
      d.setDate(d.getDate() + 1);
      continue;
    }
    let holiday = [...workday[0].personholiday];
    let eightSpans = [
      ...calendarDiv.querySelectorAll(".calendar__800 > .name"),
    ];
    let halftenSpans = [
      ...calendarDiv.querySelectorAll(".calendar__930 > .name"),
    ];
    let eight = eightSpans.map((span) => {
      if (span.classList.contains("request")) {
        return `<div class='name request'>${span.innerText}</div>`;
      } else {
        return `<div class='name'>${span.innerText}</div>`;
      }
    });

    let halften = halftenSpans.map((span) => {
      if (span.classList.contains("request")) {
        return `<div class='name request'>${span.innerText}</div>`;
      } else {
        return `<div class='name'>${span.innerText}</div>`;
      }
    });

    while (eight.length < 3) {
      if (eight.length == 1 && holiday.length > 1) {
        eight.push(`<div class='name'>&nbsp;</div>`);
        eight.push(
          `<div class='name holiday'>${holiday.pop().name} (ferien)</div>`
        );
      } else if (eight.length == 2 && holiday.length > 1) {
        eight.push(
          `<div class='name holiday'>${holiday.pop().name} (ferien)</div>`
        );
      } else {
        eight.push(`<div class='name'>&nbsp;</div>`);
      }
    }
    while (halften.length < 3) {
      if (halften.length == 1 && holiday.length != 0) {
        halften.push(`<div class='name'>&nbsp;</div>`);
        halften.push(
          `<div class='name holiday'>${holiday.pop().name} (ferien)</div>`
        );
      } else if (halften.length == 2 && holiday.length != 0) {
        halften.push(
          `<div class='name holiday'>${holiday.pop().name} (ferien)</div>`
        );
      } else {
        halften.push(`<div class='name'>&nbsp;</div>`);
      }
    }

    daterow += `<td><div class='date'>${displayDate}</div></td>`;
    schedulerow += `<td><div class='names'>${eight.join(
      ""
    )}</div><div class='names'>${halften.join("")}</div></td>`;
    d.setDate(d.getDate() + 1);
  }

  if (getDay(d) != 0) {
    for (let i = getDay(d); i < 5; i++) {
      daterow += `<td><div class='date'>&nbsp;</div></td>`;
      schedulerow += `<td><div class='names'><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div></div><div class='names'><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div></div></td>`;
    }
  }
  content += daterow;
  content += schedulerow;
  content += `</tbody></table>`;
  content += createPrintSummary();
  return content;
}

function printSchedule() {
  let printWindow = window.open("", "", "height=750,width=1150");
  printWindow.document.write("<html><head>");
  printWindow.document.write('<link rel="stylesheet" href="print.css"/>');
  printWindow.document.write("</head><body>");
  printWindow.document.write(createPrintTable());
  printWindow.document.write("</body></html>");
  printWindow.addEventListener("load", () => {
    printWindow.print();
  });
  printWindow.document.close();
}

/**
 * When the user clicks anywhere outside of the modal, close it
 * @param {Event} event - Event
 */
window.onclick = function (event) {
  if (event.target == modal || event.target == editModal) {
    closeModal();
  }
};

/**
 * Renders the UI
 */
function render() {
  partialBtn.disabled = true;
  createCalendar(year, month);
  titleMonth.innerText = `${year} ${months[month]}`;
  getWorkDays(year, month);
}

/* End of UI functions */

render();
