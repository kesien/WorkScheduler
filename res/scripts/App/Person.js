import { ID } from "./ID.js";

export class Person {
  constructor(personName) {
    this.id = ID.generateRandomID();
    this.name = personName;
    this.eight = 0;
    this.halften = 0;
    this.holiday = 0;
  }
}
