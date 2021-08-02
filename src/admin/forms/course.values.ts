import { ResourceKey } from "../../resources/types";
import Course from "../../resources/Course";
import { AdminState } from "../types";

interface CourseFormValues extends Record<string, unknown> {
  id: string;
  instructor: string;
  section: string;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const course = state.resourceInstance as Course;
  return {
    id: String(course.id),
    catalogId: course.catalogId,
    instructor: course.instructor,
    section: course.section,
  } as CourseFormValues;
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Course => {
  const { id, instructor, section } = values as CourseFormValues;
  const courses = state.resources[ResourceKey.Courses] as Course[];
  //! TODO this is a hack; expecting server to error if new Course is used
  const selectedCourse =
    courses.find((c) => c.id === Number(id)) || new Course();
  return {
    ...selectedCourse,
    instructor,
    section,
  };
};
