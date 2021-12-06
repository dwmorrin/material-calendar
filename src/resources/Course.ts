export interface Course {
  [k: string]: unknown;
  id: number;
  title: string;
  catalogId: string;
}

export class Course implements Course {
  static url = "/api/courses";
  constructor(
    course = {
      id: 0,
      title: "",
      catalogId: "",
    }
  ) {
    const { id = 0, title = "", catalogId = "" } = course;
    this.id = id;
    this.title = String(title);
    this.catalogId = String(catalogId);
  }
}

export default Course;
