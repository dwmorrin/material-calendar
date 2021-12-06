import Course from "../../resources/Course";

// actually showing a list of sections
// the same course can appear multiple times
// therefore omitting course ID
// catalog ID suffices as an ID
const template = (course: unknown): string[][] =>
  course instanceof Course
    ? [
        ["Title", course.title],
        ["Catalog ID", course.catalogId],
      ]
    : [["", JSON.stringify(course)]];

export default template;
