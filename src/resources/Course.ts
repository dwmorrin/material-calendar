import User from "../resources/User";
export interface Course {
  [k: string]: unknown;
  id: number;
  title: string;
  managers: Pick<User, "id" | "name" | "username">[];
}

export class Course implements Course {
  static url = "/api/courses";
  constructor(
    course = {
      id: 0,
      title: "",
      managers: [] as Pick<User, "id" | "name" | "username">[],
    }
  ) {
    Object.assign(this, course);
  }
}

export default Course;
