/* =======================
Date related variables
======================= */
const napok = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];
const germanWeekDays = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"];
const months = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];

const date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
let day = date.getDay();
let totalWorkDays = 0;
let workdays = [];
let wdBackup = [];
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
const modalSaveBtn = document.querySelector('.btn--save-plus');
const editModalSaveBtn = document.querySelector('.btn--edit-save');
const startBtn = document.querySelector('.btn--start');
const resetBtn = document.querySelector('.btn--reset');
const partialBtn = document.querySelector('.btn--partial');
const summaryDiv = document.querySelector('.summary');
const modal = document.getElementById("myModal");
const modalTitle = document.querySelector('.modal__title');
const editModal = document.getElementById("editModal");
const closeButtons = document.querySelectorAll(".modal__close");
const containers = document.querySelectorAll('.modalcontainer');
const printBtn = document.querySelector('.btn--print');

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
  
let pBackup = [];
/* End of persons */

/* =======================
Event listeners 
======================= */
leftBtn.addEventListener('click', leftBtnClick);
rightBtn.addEventListener('click', rightBtnClick);
typeSelect.addEventListener('change', typeChanged);
modalSaveBtn.addEventListener('click', modalSaveBtnClick);
editModalSaveBtn.addEventListener('click', editSave);
resetBtn.addEventListener('click', resetBtnClick);
startBtn.addEventListener('click', startBtnClick);
partialBtn.addEventListener('click', partialReset);
printBtn.addEventListener('click', printSchedule);
closeButtons.forEach(closeButton => {
  closeButton.addEventListener('click', closeModal);
});

containers.forEach(container => {  
  container.addEventListener('dragover', containerDragOver);
});

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
      workday.personholiday.push({name: selectedPerson, isRequest: false});
      for (let person of persons) {
        if (person.name == selectedPerson) {
          person.personholiday += 1;
          person.eight += 1; // The person will be scheduled at 9:30 more so it'll be fair by the end of month. 
        }
      }
      let personsOnHoliday = workday.personholiday.map(personObject => personObject.name);
      let personholidayDiv = calendarDivSelectedDay.querySelector('.calendar__personholiday');
      personholidayDiv.innertHTML = "";
      personholidayDiv.innerHTML = `<i class="fas fa-user-slash"></i> Szabadság: ${personsOnHoliday.join(', ')}`;
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
        workday.eight.push({name: selectedPerson, isRequest: true});
        calendarDivSelectedDay.querySelector('.calendar__800').innerHTML = createSpan(workday.eight);
        
      } else { //end of if
        workday.halften.push({name: personSelect.options[personSelect.selectedIndex].value, isRequest: true});
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

function partialReset() {
  printBtn.style.display = "none";
  workdays = [];
  workdays = [...wdBackup];
  startBtn.disabled = false;
  summaryDiv.classList.add('hidden')
  partialBtn.disabled = true;
  typeSelect.options[0].disabled = false;
  persons = [];
  persons = [...pBackup];
  refreshCalendar(true);
}

/**
 * Start button's event handler.
 */
function startBtnClick() {
  backUp();
  partialBtn.disabled = false;
  startBtn.disabled = true;
  printBtn.style.display = "block";
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
  const draggable = document.querySelector('.dragging');
  if (afterElement == null) {
    this.appendChild(draggable)
  } else {
    this.insertBefore(draggable, afterElement)
  }
}

/* End of event listeners */


/* =======================
Data functions
======================= */
/**
 * Creates a back up of the workdays and persons arrays.
 */
function backUp() {
  wdBackup = JSON.parse(JSON.stringify(workdays));
  pBackup = JSON.parse(JSON.stringify(persons));
}

function editSave(data) {
  
}

/**
 * 
 * @param {Node} container - The HTML Node where the dragging happens
 * @param {Number} x - Coordinate on the X axis
 * @returns 
 */
function getDragAfterElement(container, x) {
  const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = x - box.left - box.width / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
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
  /* if (index % 2 == 1) {
    maxPersonCountForEight += 1;
  } */
  return workdays[index].eight.length >= maxPersonCountForEight;
}

/**
 * Checks if the given person is on holiday or not.
 * @param {Number} index - Index of the given workday
 * @param {string} person - Name of the person
 * @returns - True if the given person is on holiday.
 */
function isPersonOnHoliday(index, person) {
  let personsOnHoliday = workdays[index].personholiday.filter(personObject => personObject.name == person);
  return Boolean(personsOnHoliday.length);
}

/**
 * Checks if the given person is already scheduled for 8:00.
 * @param {Number} index - Index of the given workday
 * @param {string} person - Name of the person
 * @returns - True if the given person is already scheduled for 8:00.
 */
function isAtEight(index, person) {
  let eight = workdays[index].eight.filter(personObject => personObject.name == person);
  return Boolean(eight.length)
}

/**
 * Checks if the given person is already scheduled for 9:30.
 * @param {Number} index - Index of the given workday
 * @param {string} person - Name of the person
 * @returns - True if the given person is already scheduled for 9:30.
 */
function isAtHalfTen(index, person) {
  let halften = workdays[index].halften.filter(personObject => personObject.name == person)
  return Boolean(halften.length)
}

/**
 * Checks if the day at the given index already contains the person.
 * @param {number} index - Index of the given day.
 * @param {Object} randomPerson - A person object.
 */
function personIsAlreadyAdded(index, randomPerson) {
  
  let isEight = isAtEight(index, randomPerson.name)
  let isHalfTen = isAtHalfTen(index, randomPerson.name)
  let isHoliday = isPersonOnHoliday(index, randomPerson.name)
  return (isEight || isHalfTen || isHoliday);
}

/**
 * Checks if the person is already scheduled
 * @param {number} index - Index of the given day.
 * @param {string} name - Name of the person
 */
function personAlreadyScheduled(index, name) {
  return (isAtEight(index, name) || isAtHalfTen(index, name));
}

/**
 * Increases halften by 1 for every person in halften of the day at the given index.
 * @param {number} index - Index of the given day.
 */
function updatePersonsAtHalfTen(index) {
  let personsAtHalfTen = workdays[index].halften;
  for (let person of persons) {
    for (let personAtHalfTen of personsAtHalfTen) {
      if (personAtHalfTen.name == person.name) {
        person.halften++;
      }
    }
  }
}

/**
 * Increases eight by 1 for every person in eight of the day at the given index.
 * @param {number} index - Index of the given day.
 */
function updatePersonsAtEight(index) {
  let personsAtEight = workdays[index].eight;
  for (let person of persons) {
    for (let personAtEight of personsAtEight) {
      if (personAtEight.name == person.name) {
        person.eight++;
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
    let index = workdays.indexOf(workday) // index of the day
    let maxPersonCountForEight = Math.floor((persons.length - workday.personholiday.length) / 2)
    let personsNotOnHolidays  = persons.filter(person => !isPersonOnHoliday(index, person.name)); // get every person who is not on holiday
    let names = personsNotOnHolidays.map(person => person.name); // get the names of the selected persons

    if(workday.isHoliday) { 
      continue; // Skip the day if it's holiday.
    }

    while(true) {
      if (isItMax(index)) {
        break; //Break out of the loop if reach the maximum amount of people for eight.
      }

      // We want to fairly distribute so we filter out the people who were scheduled for 9:30 at the previous day.
      let filtered;
      if (index % 2 == 1) {
        if(!workdays[index-1].isHoliday) {
          filtered = personsNotOnHolidays.filter(person => isAtHalfTen(index-1, person.name) && !personAlreadyScheduled(index, person.name));
        } else {
          filtered = personsNotOnHolidays.filter(person => person.eight < max && !personAlreadyScheduled(index, person.name));
        }
        filtered = [...filtered, ...workday.eight];
        if ((filtered.length + workday.eight.length) < maxPersonCountForEight) {
          let plusPerson = personsNotOnHolidays.filter(person => !filtered.includes(person) && !personAlreadyScheduled(index, person.name));
          let plusRandomPerson = plusPerson[Math.floor(Math.random() * plusPerson.length)];
          filtered.push(plusRandomPerson);
        }
        while(workday.eight.length != filtered.length) {
          if(workday.eight.length == Math.round(personsNotOnHolidays.length / 2)) {
            break;
          }
          let randomPerson = filtered[Math.floor(Math.random() * filtered.length)];
          if (personIsAlreadyAdded(index, randomPerson)) {
            continue; // Skip the person if it's already scheduled
          }   
          workday.eight.push({name: randomPerson.name, isRequest: false});
          persons[persons.indexOf(randomPerson)].eight++; // Increase the eight property of the randomly selected person by 1.
        }
      } else {
        filtered = personsNotOnHolidays.filter(person => person.eight < max && !personAlreadyScheduled(index, person.name));
        if ((filtered.length + workday.eight.length) < maxPersonCountForEight) {
          let plusPerson = personsNotOnHolidays.filter(person => !filtered.includes(person) && !personAlreadyScheduled(index, person.name));
          let plusRandomPerson = plusPerson[Math.floor(Math.random() * plusPerson.length)];
          filtered.push(plusRandomPerson);
        }
        let randomPerson = filtered[Math.floor(Math.random() * filtered.length)];
        if (personIsAlreadyAdded(index, randomPerson)) {
          continue; // Skip the person if it's already scheduled
        }
  
        workday.eight.push({name: randomPerson.name, isRequest: false});
        persons[persons.indexOf(randomPerson)].eight++; // Increase the eight property of the randomly selected person by 1.
      }

/*       if (index != 0) {
        // If we don't have the required amount of people (because of requests) we randomly select additional ones.
        
      } */
    }

    // Schedule the remaining persons for 9:30
    let remainingPersons = names.filter(name => !personAlreadyScheduled(index, name));
    let remainingObjects = remainingPersons.map(person => { return {name: person, isRequest: false}});
    workday.halften = workday.halften.concat(remainingObjects);

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
function createSpan(data, date) {
  let spans = data.map(person => {
    let isRequest = person.isRequest ? 'request' : ''
    return `<span class='name ${isRequest}' data-date=${date} data-name='${person.name}'>${person.name}</span>`}
    );
  return spans.join('');
}

/**
 * Updates the UI with the schedule.
 */
function refreshCalendar(isPartialRefresh = false) {
  for (let calendarDivWorkday of calendarDivWorkdays) {
    let eight = calendarDivWorkday.querySelector(".calendar__800");
    let halften = calendarDivWorkday.querySelector(".calendar__930");
    for (let workday of workdays) {
      if (workday.date == calendarDivWorkday.dataset.day) {
        if(workday.isHoliday) {
          continue;
        }
        eight.innerHTML = createSpan(workday.eight, workday.date);
        halften.innerHTML = createSpan(workday.halften, workday.date);
        addEventListeners();
      }
    }
    if (!isPartialRefresh) {
      calendarDivWorkday.classList.remove('calendar__selectable');
      calendarDivWorkday.classList.add('calendar__editable');
    } else {
      calendarDivWorkday.classList.add('calendar__selectable');
    }
  }
}

/**
 * Resets everything.
 */
function reset() {
  workdays = [];
  wdBackup = [];
  pBackup = [];
  startBtn.disabled = false;
  partialBtn.disabled = true;
  printBtn.style.display = "none";
  summaryDiv.classList.add('hidden')
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
  let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  let realDate = `0${date.getMonth() + 1}-${day}`

  if (!isWeekend(date)) {
    populateWorkdays(curDate);
    return `
    <div class='cell calendar__selectable' data-day=${curDate} data-realdate=${realDate} data-dayname=${napok[getDay(date)]}>
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
  let year, month, day;
  [year, month, day] = data.split('-');
  resetModals();
  let dayData = workdays.filter(workday => workday.date == data).map(day => {return day.personholiday.length + day.eight.length + day.halften.length});
  // Disable holiday option of the day already includes a person.
  if (dayData[0] != 0) {
    typeSelect.selectedIndex = 1;
    typeSelect.options[0].disabled = true;
    personSelectGroup.classList.remove('hidden');
  }
  let title = year + ". " + months[month] + " " + day + ".";
  modalTitle.innerText = title;
  modal.style.display = "flex";
}

function showEditModal(data) {
  let year, month, day;
  [year, month, day] = data.split('-');
  resetModals();
  let dayData = workdays.filter(workday => workday.date == data);
  if (dayData[0] != 0) {
    let title = year + ". " + months[month] + " " + day + ".";
    editModal.querySelector('.modal__title').innerText = title;
    let eight = dayData[0].eight.map(personObject => {
      return `<span draggable="true" data-name="${personObject.name}" class="draggable"><i class="fas fa-arrows-alt"></i> ${personObject.name}</span>`
    });
    let halften = dayData[0].halften.map(personObject => {
      return `<span draggable="true" data-name="${personObject.name}" class="draggable"><i class="fas fa-arrows-alt"></i> ${personObject.name}</span>`
    });
    

    editModal.querySelector('.modal__800').innerHTML = eight.join('');
    editModal.querySelector('.modal__930').innerHTML = halften.join('');
    const draggables = editModal.querySelectorAll('.draggable');

    draggables.forEach(draggable => {
      draggable.addEventListener('dragstart', () => {
        draggable.classList.add('dragging');
      });
      draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
      });
      draggable.addEventListener('touchmove', () => {
        draggable.classList.add('dragging');
      }, { passive: true });
      draggable.addEventListener('touchend', () => {
        draggable.classList.remove('dragging');
      });
    });
    editModal.style.display = "flex";
  }
}

/**
 * Resets the modal.
 */
function resetModals() {
  modalForm.reset();
  personSelectGroup.classList.add('hidden');
  whenSelectGroup.classList.add('hidden');
}

/**
 * Closes the modal.
 */
function closeModal() {
  modal.style.display = "none";
  editModal.style.display = "none";
}

/**
 * Create the calendar table and render it to the UI.
 * @param {number} year - Year
 * @param {number} month - Month
 */
function createCalendar(year, month) {
  let dayCells = napok.map(nap => { return `<div class="cell--header">${nap}</div>`}).join('');
  let table = `
  <div class="calendar__table">
    <div class="cell--header"><i class="fas fa-clock"></i></div>
    ${dayCells}
  `;
  let d = new Date(year, month);
  table += "<div class='cell cell--hours'><div class='calendar__day calendar__day--hours'><div class='calendar__day--half'>8:00</div><div class='calendar__day--half'>9:30</div></div></div>";

  // Add empty cells
  for (let i = 0; i < getDay(d); i++) {
    table += "<div class='cell calendar__day--empty'><i class='fas fa-ban'></i></div>";
  }

  while (d.getMonth() == month) {
    table += getCell(d);
    
    // Add a new row if it's end of week
    if (getDay(d) % 7 == 6) {
      let next = new Date(year, month, d.getDate() + 1);
      if(next.getMonth() == month) {
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

  table += '</div>';
  calendarDiv.innerHTML = table;
  calendarDivWorkdays = document.querySelectorAll('.calendar__selectable');

  calendarDivWorkdays.forEach(cd => {
    cd.querySelector('.calendar__plus-icon').addEventListener('click', () => {
      calendarDivSelectedDay = cd;
      showModal(cd.dataset.day);
    });
    cd.querySelector('.calendar__edit-icon').addEventListener('click', () => {
      showEditModal(cd.dataset.day);
    })
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
  summary += '</table></div>';
  return summary;
}

function createPrintTable() {
  let d = new Date(year, month);
  let content = `<div class='container'><table class='schedule'><thead><tr><th>&nbsp;</th><th><div>Montag</div></th><th><div>Dienstag</div></th>`;
  content += `<th><div>Mittwoch</div></th><th><div>Donnerstag</div></th><th><div>Freitag</div></th></tr></thead><tbody>`
  
  let daterow = `<tr><td>&nbsp;</td>`;
  let schedulerow = `<tr><td><div class='hours'><div class='eight'>8:00-16:30</div><div class='halften'>9:30-18:00</div></div></td>`
  for (let i = 0; i < getDay(d); i++) {
    daterow += `<td><div class='date'>&nbsp;</div></td>`;
    schedulerow += `<td><div class='names'><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div></div><div class='names'><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div><div class='name'>&nbsp;</div></div></td>`
  }

  while (d.getMonth() == month) {
    let curDate = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

    // We want to show the date in a readable format.
    let displayDay = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
    let displayMonth = (d.getMonth() + 1) < 10 ? "0" + (d.getMonth() + 1) : d.getMonth();
    let displayDate = `${displayDay}.${displayMonth}.${d.getFullYear()}`;

    let workday = workdays.filter(workday => workday.date == curDate);
    if (getDay(d) % 7 == 6) {
      daterow += '</tr>';
      schedulerow += '</tr>';
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
    let eight = workday[0].eight.map(personObject => {
      if(personObject.isRequest) {
        return `<div class='name request'>${personObject.name}</div>`
      } else {
        return `<div class='name'>${personObject.name}</div>`
      }
    });

    let halften = workday[0].halften.map(personObject => {
      if(personObject.isRequest) {
        return `<div class='name request'>${personObject.name}</div>`
      } else {
        return `<div class='name'>${personObject.name}</div>`
      }
    });

    while(eight.length < 3) {
      if (eight.length == 1 && holiday.length > 1) {
        eight.push(`<div class='name'>&nbsp;</div>`);
        eight.push(`<div class='name holiday'>${holiday.pop().name} (ferien)</div>`);
      } else if(eight.length == 2 && holiday.length > 1) {
        eight.push(`<div class='name holiday'>${holiday.pop().name} (ferien)</div>`);
      }else {
        eight.push(`<div class='name'>&nbsp;</div>`);
      }
    }
    while(halften.length < 3) {
      if (halften.length == 1 && holiday.length != 0) {
        halften.push(`<div class='name'>&nbsp;</div>`);
        halften.push(`<div class='name holiday'>${holiday.pop().name} (ferien)</div>`);
      } else if (halften.length == 2 && holiday.length != 0) {
        halften.push(`<div class='name holiday'>${holiday.pop().name} (ferien)</div>`);
      } else {
        halften.push(`<div class='name'>&nbsp;</div>`);
      }
    }

    daterow += `<td><div class='date'>${displayDate}</div></td>`;
    schedulerow += `<td><div class='names'>${eight.join('')}</div><div class='names'>${halften.join('')}</div></td>`;
    d.setDate(d.getDate() + 1);
  }
  content += daterow;
  content += schedulerow;
  content += `</tbody></table>`
  content += createPrintSummary();
  return content;

}

function printSchedule() {
  let printWindow = window.open('', '', 'height=750,width=1150');  
  printWindow.document.write('<html><head>');  
  printWindow.document.write('<link rel="stylesheet" href="print.css"/>')
  printWindow.document.write('</head><body>');  
  printWindow.document.write(createPrintTable());  
  printWindow.document.write('</body></html>');  
  printWindow.addEventListener('load', () => {
    printWindow.print();
  })
  printWindow.document.close();  
}  

/**
 * When the user clicks anywhere outside of the modal, close it
 * @param {Event} event - Event
 */
window.onclick = function(event) {
  if (event.target == modal || event.target == editModal) {
    closeModal();
  }
}

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