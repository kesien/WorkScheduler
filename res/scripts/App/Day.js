export class Day {
  constructor(date, daynumber, isHoliday = false, isWeekend = false) {
    this.date = date;
    this.daynumber = daynumber;
    this.personsOnHoliday = [];
    this.eight = [];
    this.halften = [];
    this.isWeekend = isWeekend;
    this.isHoliday = isHoliday;
    this.render();
  }

  calculateMaxPersonsForEight() {
    return Math.floor((persons.length - this.personholiday.length) / 2);
  }

  isItMax() {
    return this.eight.length >= this.calculateMaxPersonsForEight();
  }

  isAlreadyScheduled(id) {
    return !this.personIsNotOnHoliday(id) || !this.personIsNotScheduled(id);
  }

  isScheduled(person, arr) {
    if (arr.length !== 0 && arr.find((p) => p.id === person.id)) {
      return true;
    }

    return false;
  }

  personIsOnHoliday(id) {
    return this.isScheduled(id, this.personsOnHoliday);
  }

  personIsScheduledForEight(id) {
    return this.isScheduled(id, this.eight);
  }

  personIsScheduledForHalften(id) {
    return this.isScheduled(id, this.halften);
  }

  personIsNotScheduled(id) {
    return this.isScheduled(id, [...this.eight, ...this.halften]);
  }

  render() {
    const template = document.getElementById("cell-template");
    const templateBody = document.importNode(template.content, true);

    templateBody.querySelector(".calendar__daynumber").textContent =
      this.daynumber;
    if (this.isWeekend) {
      templateBody.classList.add("calendar__weekend");
    }
    return templateBody;
  }
}
