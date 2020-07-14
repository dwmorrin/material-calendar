import { Manager } from "../resources/User";

export interface Course {
  [k: string]: unknown;
  id: number;
  title: string;
  managers: Manager[];
}

export class Course implements Course {
  static url = "/api/courses";
  constructor(
    course = {
      id: 0,
      title: "",
      managers: [] as Manager[],
    }
  ) {
    Object.assign(this, course);
  }
}

export default Course;
