import { Day } from "./App/Day.js";
import { Person } from "./App/Person.js";

class App {
  static init() {
    const persons = [
      new Person("Heni"),
      new Person("Anita"),
      new Person("Marina"),
      new Person("Judit"),
      new Person("Orsi"),
    ];
  }
}

App.init();
