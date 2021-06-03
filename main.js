/* =======================
Date related variables
======================= */
const napok = ["vasárnap", "hétfő", "kedd", "szerda", "csütörtök", "péntek", "szombat"];
const months = ["Január", "Február", "Március", "Április", "Május", "Június", "Július", "Augusztus", "Szeptember", "Október", "November", "December"];

const date = new Date();
let year = date.getFullYear();
let month = date.getMonth();
let day = date.getDay();
let totalWorkDays = 0;
let workdays = [];

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
const personSelectGroup = document.querySelector('.modal__form__group--person');
const whenSelectGroup = document.querySelector('.modal__form__group--when');
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

/* =======================
Add event listeners 
======================= */
leftBtn.addEventListener('click', leftBtnClick);
rightBtn.addEventListener('click', rightBtnClick);
typeSelect.addEventListener('change', typeChanged);
modalSaveBtn.addEventListener('click', modalSaveBtnClick);
resetBtn.addEventListener('click', resetBtnClick);
startBtn.addEventListener('click', startBtnClick);
span.addEventListener('click', closeModal);

/* =======================
Event functions
======================= */
function leftBtnClick() {
  month -= 1;
  if (month < 0) {
    year -= 1;
    month = 11;
  }
  reset();
  render();
}

function rightBtnClick() {
  month += 1;
  if (month > 11) {
    year += 1;
    month = 0;
  }
  reset();
  render();
}

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

function addPersonHoliday() {
  for (let workday of workdays) {
    if (workday.date == calendarDivSelectedDay.dataset.day) {
      let selectedPerson = personSelect.options[personSelect.selectedIndex].value
      workday.personholiday.push(selectedPerson);
      for (let person of persons) {
        if (person.name == selectedPerson) {
          person.personholiday += 1;
          person.eight += 1;
        }
      }
      let personholidayDiv = calendarDivSelectedDay.querySelector('.calendar__personholiday');
      personholidayDiv.innertHTML = "";
      personholidayDiv.innerHTML = `<i class="fas fa-user-slash"></i> Szabadság: ${workday.personholiday.join(', ')}`;
    }
  }
}

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
        calendarDivSelectedDay.querySelector('.calendar__800').innerText = workday.eight.join(', ');
      } else { //end of if
        workday.halften.push(personSelect.options[personSelect.selectedIndex].value);
        calendarDivSelectedDay.querySelector('.calendar__930').innerText = workday.halften.join(', ');
      } //end of else
    } // end of if
  } // end of for
}

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

function resetBtnClick() {
  reset();
  render();
}

function startBtnClick() {
  createSchedule();
  refreshCalendar();
  showSummary();
}

/* =======================
Data functions
======================= */
function getDaysInMonth(month, year) {
  return new Date(year, month - 1, 0).getDate();
}

function getDay(date) { // get day number from 0 (monday) to 6 (sunday)
  let day = date.getDay();
  if (day == 0) day = 7; // make Sunday (0) the last day
  return day - 1;
}

function isWeekend(d) {
  let weekday = getDay(d);
  return weekday % 7 == 6 || weekday % 7 == 5 ? true : false;
}

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

function updateEveryPersonInfo() {
  for (let person of persons) {
    person.eight = person.eight - person.personholiday;
  }
}

function isItMax(index) {
  let maxPersonCountForEight = Math.floor((persons.length - workdays[index].personholiday.length) / 2);
  return workdays[index].eight.length >= maxPersonCountForEight;
}

function personIsAlreadyAdded(index, randomPerson) {
  let isAtEight = workdays[index].eight.includes(randomPerson.name);
  let isAtHalfTen = workdays[index].halften.includes(randomPerson.name);
  let isAtHoliday = workdays[index].personholiday.includes(randomPerson.name);
  return (isAtEight || isAtHalfTen || isAtHoliday);
}

function personNotAddedYet(index, name) {
  return !(workdays[index].eight.includes(name) || workdays[index].halften.includes(name));
}

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

function createSchedule() {
  let max = 1;
  for (let workday of workdays) {
    let maxPersonCountForEight = Math.floor((persons.length - workday.personholiday.length) / 2)
    let personsNotOnHolidays  = persons.filter(person => !workday.personholiday.includes(person.name));
    let names = personsNotOnHolidays.map(person => person.name);
    let index = workdays.indexOf(workday)
    
    if(workday.isHoliday) {
      continue;
    }

    while(true) {
      if (isItMax(index)) {
        break;
      }

      let filtered = personsNotOnHolidays.filter(person => person.eight < max && personNotAddedYet(index, person.name));
      if (index != 0) {
        if ((filtered.length + workday.eight.length) < maxPersonCountForEight) {
          let plusPerson = persons.filter(person => !filtered.includes(person) && personNotAddedYet(index, person.name));
          let plusRandomPerson = plusPerson[Math.floor(Math.random() * plusPerson.length)];
          filtered.push(plusRandomPerson);
        }
      }

      let randomPerson = filtered[Math.floor(Math.random() * filtered.length)];
      if (personIsAlreadyAdded(index, randomPerson)) {
        continue;
      }

      workday.eight.push(randomPerson.name);
      persons[persons.indexOf(randomPerson)].eight++;
    }

    let remainingPersons = names.filter(name => !workday.eight.includes(name) && !workday.halften.includes(name));
    workday.halften = workday.halften.concat(remainingPersons);

    updatePersonsAtHalfTen(index);

    max = index % 2 == 1 ? max += 1 : max
  }
}

/* =======================
UI functions
======================= */
function refreshCalendar() {
  for (let calendarDivWorkday of calendarDivWorkdays) {
    let eight = calendarDivWorkday.querySelector(".calendar__800");
    let halften = calendarDivWorkday.querySelector(".calendar__930");
    for (let workday of workdays) {
      if (workday.date == calendarDivWorkday.dataset.day) {
        if(workday.isHoliday) {
          continue;
        }
        eight.innerText = workday.eight.join(', ');
        halften.innerText = workday.halften.join(', ');
      }
    }
    calendarDivWorkday.classList.remove('calendar__selectable');
  }
}

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
    let row = `<tr>
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

function getCell(d) {
  let weekend = isWeekend(d)
  let curDate = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  if (weekend) {
    return `
    <td class='calendar__weekend'>
      <div>
        <span class='calendar__daynumber'>${d.getDate()}</span>
      </div>
    </td>`;
  } else {
    populateWorkdays(curDate);
    return `
    <td class='calendar__selectable' data-day=${curDate}>
      <div class='calendar__splitday'>
        <div class='calendar__personholiday'></div>
        <span class='calendar__daynumber'>${d.getDate()}</span>
        <div class='calendar__day calendar__800'></div>
        <div class='calendar__day calendar__930'></div>
      </div>
    </td>`;
  }
}

function showModal(data) {
  let year, month, day;
  [year, month, day] = data.split('-');
  resetModal();
  let dayData = workdays.filter(workday => workday.date == data).map(day => {return day.personholiday.length + day.eight.length + day.halften.length});
  if (dayData[0] != 0) {
    typeSelect.selectedIndex = 1;
    typeSelect.options[0].disabled = true;
    personSelectGroup.classList.remove('hidden');
    whenSelectGroup.classList.add('hidden');
  }
  let title = year + ". " + months[month] + " " + day + ".";
  modalTitle.innerText = title;
  modal.style.display = "block";
}

function resetModal() {
  modalForm.reset();
  personSelectGroup.classList.add('hidden');
  whenSelectGroup.classList.add('hidden');
}

function closeModal() {
  modal.style.display = "none";
}

function createCalendar(calendardiv, year, month) {
  let table = '<table class="calendar__table"><tr><th><i class="fas fa-clock"></i></th><th>Hétfő</th><th>Kedd</th><th>Szerda</th><th>Csütörtök</th><th>Péntek</th><th>Szombat</th><th>Vasárnap</th></tr><tr>';
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

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    closeModal();
  }
}

function render() {
  workdays = [];
  createCalendar(calendarDiv, year, month);
  titleMonth.innerText = `${year} ${months[month]}`;
  getWorkDays(year, month);
}




render();