import { formatSQLDate } from "../utils/date";

interface Semester {
  [k: string]: unknown;
  id: number;
  title: string;
  start: string;
  end: string;
  active: boolean;
}

class Semester implements Semester {
  static url = "/api/semesters";
  constructor(
    semester = {
      id: 0,
      title: "",
      start: formatSQLDate(),
      end: formatSQLDate(),
      active: false,
    }
  ) {
    Object.assign(this, semester);
  }
}

export default Semester;
