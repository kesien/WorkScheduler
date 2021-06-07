/* =======================
Date related variables
======================= */
const napok = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
const months = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];

const date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
let day = date.getDay();
let totalWorkDays = 0;
let workdays = [];
/* End of date relted variables */

/* =======================
HTML Elements
======================= */
const calendarDiv = document.querySelector('#calendar__body');
const titleMonth = document.querySelector('.calendar__title');
const leftBtn = document.querySelector('#left-arrow');
const rightBtn = document.querySelector('#right-arrow');
const typeSelect = document.querySelector('#typeSelect');
const personSelect = document.querySelector('#personSelect');
const whenSelect = document.querySelector('#whenSelect');
const personSelectGroup = document.querySelector('.modal__form-group--person');
const whenSelectGroup = document.querySelector('.modal__form-group--when');
const modalForm = document.querySelector('.modal__form')
const modalSaveBtn = document.querySelector('.btn--save');
const startBtn = document.querySelector('.btn--start');
const resetBtn = document.querySelector('.btn--reset');
const summaryDiv = document.querySelector('.summary');
const modal = document.getElementById("myModal");
const modalTitle = document.querySelector('.modal__title');
const span = document.getElementsByClassName("modal__close")[0];

let calendarDivWorkdays;
let calendarDivSelectedDay;
/* End of HTML Elements */

/* =======================
Each person to be scheduled
======================= */
const persons = [
  { 
    name: "Heni",
    eight: 0,
    halften: 0,
    personholiday: 0
  },
  { 
    name: "Anita",
    eight: 0,
    halften: 0,
    personholiday: 0
  },
  { 
    name: "Timi",
    eight: 0,
    halften: 0,
    personholiday: 0
   },
   {
     name: "Marina",
     eight: 0,
     halften: 0,
     personholiday: 0
   },
   {
     name: "Judit",
     eight: 0,
     halften: 0,
     personholiday: 0
   },
   {
     name: "Orsi",
     eight: 0,
     halften: 0,
     personholiday: 0
   }
];
/* End of persons */

/* =======================
Event listeners 
======================= */
leftBtn.addEventListener('click', leftBtnClick);
rightBtn.addEventListener('click', rightBtnClick);
typeSelect.addEventListener('change', typeChanged);
modalSaveBtn.addEventListener('click', modalSaveBtnClick);
resetBtn.addEventListener('click', resetBtnClick);
startBtn.addEventListener('click', startBtnClick);
span.addEventListener('click', closeModal);

/**
 * Add the mouseover and mouseleave event listeners to all names
 */
function addEventListeners() {
  let spans = document.querySelectorAll('.name');
  for (let span of spans) {
    span.addEventListener('mouseover', (e) => {
      highlightName(e);
    });
    span.addEventListener('mouseleave', (e) => {
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
  reset();
  render();
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
  reset();
  render();
}

/**
 * Displays or hide personSelectGroup and whenSelectgroup in the Modal based on typeSelect's value.
 */
function typeChanged() {
  if (typeSelect.options[typeSelect.selectedIndex].value == "personholiday") {
    personSelectGroup.classList.remove('hidden');
    whenSelectGroup.classList.add('hidden');
  } else if (typeSelect.options[typeSelect.selectedIndex].value == "request") {
    personSelectGroup.classList.remove('hidden');
    whenSelectGroup.classList.remove('hidden');
  } else {
    personSelectGroup.classList.add('hidden');
    whenSelectGroup.classList.add('hidden');
  }
}

/**
 * Marks the selected day as holiday and update the UI accordingly.
 */
function addHoliday() {
  calendarDivSelectedDay.classList.add('calendar__holiday');
  calendarDivSelectedDay.innerHTML = `<i class="fas fa-grin-beam"></i>`;
  calendarDivSelectedDay.classList.remove('calendar__selectable');
  for (workday of workdays) {
    if (workday.date == calendarDivSelectedDay.dataset.day) {
      workday.isHoliday = true;
    }
  }
  totalWorkDays -= 1;
}

/**
 * Increases the selected person's holiday count by 1 and display it's name on the UI.
 */
function addPersonHoliday() {
  for (let workday of workdays) {
    if (workday.date == calendarDivSelectedDay.dataset.day) {
      let selectedPerson = personSelect.options[personSelect.selectedIndex].value
      workday.personholiday.push(selectedPerson);
      for (let person of persons) {
        if (person.name == selectedPerson) {
          person.personholiday += 1;
          person.eight += 1; // The person will be scheduled at 9:30 more so it'll be fair by the end of month. 
        }
      }
      let personholidayDiv = calendarDivSelectedDay.querySelector('.calendar__personholiday');
      personholidayDiv.innertHTML = "";
      personholidayDiv.innerHTML = `<i class="fas fa-user-slash"></i> Szabadság: ${workday.personholiday.join(', ')}`;
    }
  }
}
/**
 * Adds the person's request and update the UI.
 */
function addRequest() {
  let requestType = whenSelect.options[whenSelect.selectedIndex].value;
  let selectedPerson = personSelect.options[personSelect.selectedIndex].value;
  for (let workday of workdays) {
    if (workday.date == calendarDivSelectedDay.dataset.day) {
      if (requestType == 8) {
        for (let person of persons) {
          if (person.name == selectedPerson) {
            person.eight += 1;
          } // end of if
        } // end of for
        workday.eight.push(selectedPerson);
        calendarDivSelectedDay.querySelector('.calendar__800').innerHTML = createSpan(workday.eight);
        
      } else { //end of if
        workday.halften.push(personSelect.options[personSelect.selectedIndex].value);
        calendarDivSelectedDay.querySelector('.calendar__930').innerHTML = createSpan(workday.halften);
      }
      addEventListeners(); //end of else
    } // end of if
  } // end of for
}

/**
 * Calls the correct function based on typeSelect's value and close the modal.
 * @param {Event} event - The event
 */
function modalSaveBtnClick(event) {
  event.preventDefault();
  let type = typeSelect.options[typeSelect.selectedIndex].value;
  
  if (type == "holiday") {
    addHoliday();
  } else if (type == "personholiday") {
    addPersonHoliday();
  } else if (type == "request") {
    addRequest();
  }      
  modal.style.display = "none";
}

/**
 * Highlights the selected names
 * @param {Event} event - Event
 */
function highlightName(event) {
  let spans = document.querySelectorAll('.name');
  let rows = document.querySelectorAll('.summary-table__row');
  for (let span of spans) {
    if (span.dataset.name == event.target.dataset.name) {
      span.classList.add('highlight');
    }
  }
  for (let row of rows) {
    if (row.dataset.name == event.target.dataset.name) {
      row.classList.add('summary-table__row--highlight');
    }
  }
}

/**
 * Removes the highlight class from the given elements
 * @param {Event} event - Event
 */
function removeHighlight(event) {
  let spans = document.querySelectorAll('.name');
  let rows = document.querySelectorAll('.summary-table__row');
  for (let span of spans) {
    if (span.dataset.name == event.target.dataset.name) {
      span.classList.remove('highlight');
    }
  }
  for (let row of rows) {
    if (row.dataset.name == event.target.dataset.name) {
      row.classList.remove('summary-table__row--highlight');
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

/**
 * Start button's event handler.
 */
function startBtnClick() {
  createSchedule();
  refreshCalendar();
  showSummary();
}

/* End of event listeners */


/* =======================
Data functions
======================= */

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
  return (weekday % 7 == 6 || weekday % 7 == 5);
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
      return
    }
  }
  workdays.push({
    date: date,
    personholiday: [],
    eight: [],
    halften: [],
    isHoliday: false
  });
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
 * Checks the length of eight propety for the day at the given index.
 * @summary Return true it's more or equal than maxPersonCountForEight.
 * @param {number} index - Index of the given day.
 */
function isItMax(index) {
  let maxPersonCountForEight = Math.floor((persons.length - workdays[index].personholiday.length) / 2);
  return workdays[index].eight.length >= maxPersonCountForEight;
}

/**
 * Checks if the day at the given index already contains the person.
 * @param {number} index - Index of the given day.
 * @param {Object} randomPerson - A person object.
 */
function personIsAlreadyAdded(index, randomPerson) {
  let isAtEight = workdays[index].eight.includes(randomPerson.name);
  let isAtHalfTen = workdays[index].halften.includes(randomPerson.name);
  let isAtHoliday = workdays[index].personholiday.includes(randomPerson.name);
  return (isAtEight || isAtHalfTen || isAtHoliday);
}

/**
 * Checks if the person is already scheduled
 * @param {number} index - Index of the given day.
 * @param {string} name - Name of the person
 */
function personAlreadyScheduled(index, name) {
  return (workdays[index].eight.includes(name) || workdays[index].halften.includes(name));
}

/**
 * Increases halften by 1 for every person in halften of the day at the given index.
 * @param {number} index - Index of the given day.
 */
function updatePersonsAtHalfTen(index) {
  let personsAtHalfTen = workdays[index].halften;
  for (let person of persons) {
    for (let personAtHalfTen of personsAtHalfTen) {
      if (personAtHalfTen == person.name) {
        person.halften++;
      }
    }
  }
}

/**
 * Creates the schedule
 * @summary Loop through every workdays and randomly schedule every person for 8:00 or 9:30.
 */
function createSchedule() {
  let max = 1; // A helper variable which is increased by 1 every second loop.
  for (let workday of workdays) {
    let maxPersonCountForEight = Math.floor((persons.length - workday.personholiday.length) / 2)
    let personsNotOnHolidays  = persons.filter(person => !workday.personholiday.includes(person.name)); // get every person who is not on holiday
    let names = personsNotOnHolidays.map(person => person.name); // get the names of the selected persons
    let index = workdays.indexOf(workday) // index of the day
    
    if(workday.isHoliday) { 
      continue; // Skip the day if it's holiday.
    }

    while(true) {
      if (isItMax(index)) {
        break; //Break out of the loop if reach the maximum amount of people for eight.
      }

      // We want to fairly distribute so we filter out the people who were scheduled for 9:30 at the previous day.
      let filtered = personsNotOnHolidays.filter(person => person.eight < max && !personAlreadyScheduled(index, person.name));
      if (index != 0) {

        // If we don't have the required amount of people (because of requests) we randomly select additional ones.
        if ((filtered.length + workday.eight.length) < maxPersonCountForEight) {
          let plusPerson = persons.filter(person => !filtered.includes(person) && !personAlreadyScheduled(index, person.name));
          let plusRandomPerson = plusPerson[Math.floor(Math.random() * plusPerson.length)];
          filtered.push(plusRandomPerson);
        }
      }

      let randomPerson = filtered[Math.floor(Math.random() * filtered.length)];
      if (personIsAlreadyAdded(index, randomPerson)) {
        continue; // Skip the person if it's already scheduled
      }

      workday.eight.push(randomPerson.name);
      persons[persons.indexOf(randomPerson)].eight++; // Increase the eight property of the randomly selected person by 1.
    }

    // Schedule the remaining persons for 9:30
    let remainingPersons = names.filter(name => !workday.eight.includes(name) && !workday.halften.includes(name));
    workday.halften = workday.halften.concat(remainingPersons);

    updatePersonsAtHalfTen(index);

    max = index % 2 == 1 ? max += 1 : max // Increase max by 1 for every second iteration.
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
function createSpan(data) {
  let spans = data.map(person => `<span class='name' data-name='${person}'>${person}</span>`);
  return spans.join(',&nbsp;');
}

/**
 * Updates the UI with the schedule.
 */
function refreshCalendar() {
  for (let calendarDivWorkday of calendarDivWorkdays) {
    let eight = calendarDivWorkday.querySelector(".calendar__800");
    let halften = calendarDivWorkday.querySelector(".calendar__930");
    for (let workday of workdays) {
      if (workday.date == calendarDivWorkday.dataset.day) {
        if(workday.isHoliday) {
          continue;
        }
        eight.innerHTML = createSpan(workday.eight);
        halften.innerHTML = createSpan(workday.halften);
        addEventListeners();
      }
    }
    calendarDivWorkday.classList.remove('calendar__selectable');
  }
}

/**
 * Resets everything.
 */
function reset() {
  summaryDiv.classList.add('hidden')
  typeSelect.options[0].disabled = false;
  totalWorkDays = 0;
  workdays = [];
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
  summaryDiv.innerHTML += "<h3>Munkanapok száma: " + totalWorkDays + "</h3>";
  summaryDiv.innerHTML += "<p><strong>Eloszlás:</strong> </p>";
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
  summaryDiv.innerHTML += table;
  summaryDiv.classList.remove('hidden');
}

/**
 * Returns the correct table cell for the given date and call populateWorkdays.
 * @param {Date} date - The date.
 */
function getCell(date) {
  let curDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

  if (!isWeekend(date)) {
    populateWorkdays(curDate);
    return `
    <td class='calendar__selectable' data-day=${curDate}>
      <div class='calendar__splitday'>
        <div class='calendar__personholiday'></div>
        <div class='calendar__day calendar__800'></div>
        <div class='calendar__day calendar__930'></div>
        <span class='calendar__daynumber'>${date.getDate()}</span>
      </div>
    </td>`;
  } else {
    return `
    <td class='calendar__weekend'>
      <div>
        <span class='calendar__daynumber'>${date.getDate()}</span>
      </div>
    </td>`;
  }
}

/**
 * Displays the modal.
 * @param {string} data - Date string e.g.: 2021-06-01
 */
function showModal(data) {
  let year, month, day;
  [year, month, day] = data.split('-');
  resetModal();
  let dayData = workdays.filter(workday => workday.date == data).map(day => {return day.personholiday.length + day.eight.length + day.halften.length});
  // Disable holiday option of the day already includes a person.
  if (dayData[0] != 0) {
    typeSelect.selectedIndex = 1;
    typeSelect.options[0].disabled = true;
    personSelectGroup.classList.remove('hidden');
  }
  let title = year + ". " + months[month] + " " + day + ".";
  modalTitle.innerText = title;
  modal.style.display = "block";
}

/**
 * Resets the modal.
 */
function resetModal() {
  modalForm.reset();
  personSelectGroup.classList.add('hidden');
  whenSelectGroup.classList.add('hidden');
}

/**
 * Closes the modal.
 */
function closeModal() {
  modal.style.display = "none";
}

/**
 * Create the calendar table and render it to the UI.
 * @param {Object} calendardiv - The HTML element which contains the calendar
 * @param {number} year - Year
 * @param {number} month - Month
 */
function createCalendar(calendardiv, year, month) {
  let dayCells = napok.map(nap => { return `<th>${nap}</th>`}).join('');
  let table = `
  <table class="calendar__table">
    <tr>
      <th><i class="fas fa-clock"></i></th>
      ${dayCells}
    </tr>
    <tr>`;
  let d = new Date(year, month);

  table += "<td><div class='calendar__splitday calendar__splitday--hours'><div class='calendar__splitday--half calendar__day'>8:00</div><div class='calendar__splitday--half calendar__day'>9:30</div></div></td>";

  // Add empty cells
  for (let i = 0; i < getDay(d); i++) {
    table += "<td class='calendar__day--empty'><i class='fas fa-ban'></i></td>";
  }
  
  while (d.getMonth() == month) {
    table += getCell(d);
    
    // Add a new row if it's end of week
    if (getDay(d) % 7 == 6) {
      table += '</tr><tr>'
      let next = new Date(year, month, d.getDate() + 1);
      if(next.getMonth() == month) {
        table += "<td><div class='calendar__splitday calendar__splitday--hours'><div class='calendar__splitday--half calendar__day'>8:00</div><div class='calendar__splitday--half calendar__day'>9:30</div></div></td>";
      }

    }
    
    d.setDate(d.getDate() + 1);
  }

  // Add empty cells
  if (getDay(d) != 0) {
    for (let i = getDay(d); i < 7; i++) {
      table += "<td class='calendar__day--empty'><i class='fas fa-ban'></i></td>";
    }
  }

  table += '</tr></table>';
  calendarDiv.innerHTML = table;
  calendarDivWorkdays = document.querySelectorAll('.calendar__selectable');

  calendarDivWorkdays.forEach(cd => cd.addEventListener('click', (e) => {
    calendarDivSelectedDay = cd;
    showModal(e.target.dataset.day);
  }));
}

/**
 * When the user clicks anywhere outside of the modal, close it
 * @param {Event} event - Event
 */
window.onclick = function(event) {
  if (event.target == modal) {
    closeModal();
  }
}

/**
 * Renders the UI
 */
function render() {
  workdays = [];
  createCalendar(calendarDiv, year, month);
  titleMonth.innerText = `${year} ${months[month]}`;
  getWorkDays(year, month);
}

/* End of UI functions */

render();