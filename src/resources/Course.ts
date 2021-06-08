export interface Course {
  [k: string]: unknown;
  id: number;
  title: string;
  instructor: string;
}

export class Course implements Course {
  static url = "/api/courses";
  constructor(
    course = {
      id: 0,
      title: "",
      instructor: "",
    }
  ) {
    Object.assign(this, course);
  }
}

export default Course;
