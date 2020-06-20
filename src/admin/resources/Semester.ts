interface Semester {
  id: number;
  title: string;
  start: string;
  end: string;
  active: boolean;
}

class Semester implements Semester {
  static url = "/api/semesters";
  constructor(
    s = {
      id: 0,
      title: "",
      start: "",
      end: "",
      active: false,
    }
  ) {
    Object.assign(this, s);
  }
}

export default Semester;