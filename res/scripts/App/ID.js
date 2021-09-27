export class ID {
  static generatedIds = [];
  static generateRandomID() {
    let randomID = [];
    for (let i = 0; i < 3; i++) {
      randomID.push(ID.generateRandomSequence());
    }
    randomID = randomID.join("-");

    if (!ID.generatedIds.includes(randomID)) {
      ID.generatedIds.push(randomID);
      return randomID;
    } else {
      ID.generateRandomID();
    }
  }

  static generateRandomSequence() {
    let sequence = [];
    for (let i = 0; i < 9; i++) {
      let random = Math.floor(Math.random() * 9);
      sequence.push(random);
    }
    return sequence.join("");
  }
}
