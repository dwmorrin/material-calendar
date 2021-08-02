interface Section {
  id: number;
  courseId: number;
  title: string;
  instructor: string;
}

class Section implements Section {
  static url = "/api/sections";
  constructor(sec = { id: 0, courseId: 0, title: "", instructor: "" }) {
    Object.assign(this, sec);
  }
}

export default Section;
