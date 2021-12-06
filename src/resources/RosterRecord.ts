import Section from "./Section";

export interface Student {
  name: {
    first: string;
    middle: string;
    last: string;
  };
  id: number;
  username: string;
}

export interface RosterRecord {
  [k: string]: unknown;
  id: number;
  section: Section;
  student: Student;
}

export class RosterRecord implements RosterRecord {
  static url = "api/rosters";

  constructor(
    rosterRecord = {
      section: new Section(),
      student: {
        name: { first: "", middle: "", last: "" },
        id: -1,
        username: "",
      },
    }
  ) {
    Object.assign(this, rosterRecord);
  }
}

export default RosterRecord;
