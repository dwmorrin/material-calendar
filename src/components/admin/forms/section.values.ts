import Section from "../../../resources/Section";
import { AdminState } from "../types";

interface SectionFormValues extends Record<string, unknown> {
  id: number;
  courseId: string;
  instructor: string;
  title: string;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const section = state.resourceInstance as Section;
  return {
    id: section.id,
    courseId: String(section.courseId),
    instructor: section.instructor,
    title: section.title,
  } as SectionFormValues;
};

export const update = (
  _: AdminState,
  values: Record<string, unknown>
): Section => {
  const { id, courseId, instructor, title } = values as SectionFormValues;
  return {
    id,
    courseId: Number(courseId),
    instructor,
    title,
    semesterId: 0, // !this assumes 'current semester' is overriding somewhere
  };
};
