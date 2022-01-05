import Course from "../../../resources/Course";
import { AdminState } from "../types";

interface CourseFormValues extends Record<string, unknown> {
  id: string;
  title: string;
  catalogId: string;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const course = state.resourceInstance as Course;
  return {
    id: String(course.id),
    catalogId: course.catalogId,
    title: course.title,
  } as CourseFormValues;
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Course => {
  const { title, catalogId } = values as CourseFormValues;
  const course = state.resourceInstance as Course;
  return {
    ...course,
    title,
    catalogId,
  };
};
