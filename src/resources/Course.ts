export interface Course {
  [k: string]: unknown;
  id: number;
  title: string;
  catalogId: string;
  section: string;
  instructor: string;
}

export class Course implements Course {
  static url = "/api/courses";
  constructor(
    course = {
      id: 0,
      title: "",
      catalogId: "",
      section: "",
      instructor: "",
    }
  ) {
    const {
      id = 0,
      title = "",
      catalogId = "",
      section = "",
      instructor = "",
    } = course;
    this.id = id;
    this.title = String(title);
    this.catalogId = String(catalogId);
    this.instructor = String(instructor);
    this.section = String(section); // database bug: can send title "1" as 1
  }
}

export default Course;
