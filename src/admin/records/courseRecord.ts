import Course from "../../resources/Course";

const template = (course: unknown): string[][] =>
  course instanceof Course
    ? [["Title", course.title]]
    : [["", JSON.stringify(course)]];

export default template;
