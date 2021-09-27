import { Day } from "./Day";

export class Calendar {
  constructor(year, month) {
    this.date = new Date(year, month, 0);
    this.daysInMonth = this.getDaysInMonth();
    this.days = this.createDayNodes();
  }

  getDaysInMonth() {
    const year = this.date.getFullYear();
    const month = this.date.getMonth();

    return new Date(year, month + 1, 0).getDate();
  }

  getDay(date) {
    let day = date.getDay();
    if (day == 0) {
      day = 7; // make Sunday (0) the last day
    }
    return day - 1;
  }

  createDayNodes() {
    const dayNodes = [];
    for (let i = 1; i <= this.daysInMonth; i++) {
      const dateString = `${this.date.getFullYear()}-${this.date.getMonth()}-${i}`;
      const day = new Day(
        dateString,
        i,
        false,
        this.getDay(new Date(dateString)) % 7 >= 5
      );
      dayNodes.push(day);
    }
    return dayNodes;
  }

  render() {
    let date = new Date(this.date);
    const emptyCellTemplate = document.getElementById("empty_cell_template");
    const hoursCellTemplate = document.getElementById("hours_cell_template");
    const calendarDiv = document.querySelector(".calendar__table");
    const templateBody = document.importNode(template.content, true);
    calendarDiv.appendChild(hoursCellBody);
    for (let i = 0; i < this.getDay(date); i++) {
      const emptyCellBody = document.importNode(
        emptyCellTemplate.content,
        true
      );
      calendarDiv.appendChild(emptyCellBody);
    }
    while (date.getMonth() == this.date.getMonth()) {
      calendarDiv.appendChild(this.getCell(date));
      if (this.getDay(date) % 7 == 6) {
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
  }
}
