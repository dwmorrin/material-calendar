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
  project: { title: string };
}

export interface Student {
  name: {
    first: string;
    last: string;
  };
  id: string;
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
        instructor: "",
      },
      student: { name: { first: "", last: "" }, id: "" },
    }
  ) {
    Object.assign(this, rosterRecord);
  }

  static read(record: RosterRecord, fields: string[], id = -1): RosterRecord {
    record.id = id;
    const [last, first] = fields[RosterFields.STUDENT_NAME].split(", ");
    record.course = {
      title: fields[RosterFields.COURSE_TITLE],
      catalogId: fields[RosterFields.COURSE_CATALOG_ID],
      section: fields[RosterFields.COURSE_SECTION],
      instructor: fields[RosterFields.COURSE_INSTRUCTOR],
      project: { title: fields[RosterFields.PROJECT_TITLE] },
    };
    record.student = {
      name: { first, last },
      id: fields[RosterFields.STUDENT_ID],
    };
    return record;
  }
}

export default RosterRecord;
