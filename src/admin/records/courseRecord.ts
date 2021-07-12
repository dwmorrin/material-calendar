import Course from "../../resources/Course";

const template = (course: unknown): string[][] =>
  course instanceof Course
    ? [
        ["ID", course.id.toString()],
        ["Title", course.title],
        ["Catalog ID", course.catalogId],
        ["Section", course.section],
        ["Instructor", course.instructor],
      ]
    : [["", JSON.stringify(course)]];

export default template;
