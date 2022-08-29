interface Section {
  id: number;
  semesterId: number;
  courseId: number;
  title: string;
  instructor: string;
}

class Section implements Section {
  static url = "/api/sections";
  constructor(
    sec = { id: 0, courseId: 0, title: "", instructor: "", semesterId: 0 }
  ) {
    this.id = Number(sec.id);
    this.semesterId = Number(sec.semesterId);
    this.title = String(sec.title);
    this.courseId = Number(sec.courseId);
    this.instructor = String(sec.instructor);
  }
}

export default Section;
