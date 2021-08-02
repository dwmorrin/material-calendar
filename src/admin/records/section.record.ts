import Section from "../../resources/Section";
import Course from "../../resources/Course";
import { AdminState } from "../types";
import { ResourceKey } from "../../resources/types";

// actually showing a list of sections
// the same course can appear multiple times
// therefore omitting course ID
// catalog ID suffices as an ID
const template = (section: unknown, state: AdminState): string[][] => {
  const courses = state.resources[ResourceKey.Courses] as Course[];
  if (section instanceof Section) {
    const course = courses.find(({ id }) => id === section.courseId);
    if (!course) return [["Error", "Course not found"]];
    return [
      ["Course", course.title],
      ["Catalog ID", course.catalogId],
      ["Section", section.title],
      ["Instructor", section.instructor],
    ];
  }
  return [["", JSON.stringify(section)]];
};

export default template;
