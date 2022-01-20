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
  course: {
    id: number;
    title: string;
    section: string;
    catalogId: string;
    instructor: string;
  };
  student: Student;
}

export class RosterRecord implements RosterRecord {
  static url = "api/rosters";

  constructor(
    rosterRecord = {
      course: { id: -1, title: "", section: "", catalogId: "", instructor: "" },
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
