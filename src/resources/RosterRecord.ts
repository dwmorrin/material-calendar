export enum RosterFields {
  COURSE_TITLE,
  COURSE_CATALOG_ID,
  COURSE_SECTION,
  COURSE_INSTRUCTOR,
  STUDENT_NAME,
  STUDENT_ID,
  PROJECT_TITLE,
}

export interface Course {
  title: string;
  catalogId: string;
  section: string;
  instructor: string;
}

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
  course: Course;
  student: Student;
}

export class RosterRecord implements RosterRecord {
  static url = "api/rosters";

  constructor(
    rosterRecord = {
      course: {
        title: "",
        catalogId: "",
        section: "",
        instructor: "",
      },
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
