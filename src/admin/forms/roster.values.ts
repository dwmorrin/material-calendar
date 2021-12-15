import RosterRecord from "../../resources/RosterRecord";
import User from "../../resources/User";
import Course from "../../resources/Course";
import { ResourceKey } from "../../resources/types";
import { AdminState } from "../types";
import Section from "../../resources/Section";

interface RosterValues extends Record<string, unknown> {
  username: string;
  course: string;
  section: string;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const rosterRecord = state.resourceInstance as RosterRecord;
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const course =
    courses.find((c) => c.catalogId === rosterRecord.course.catalogId) ||
    new Course();
  return {
    username: rosterRecord.student.username,
    course: course.title,
    section: rosterRecord.course.section,
  } as RosterValues;
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): RosterRecord => {
  const rosterRecord = state.resourceInstance as RosterRecord;
  const {
    username,
    course: courseTitle,
    section: sectionTitle,
  } = values as RosterValues;
  const users = state.resources[ResourceKey.Users] as User[];
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const course =
    courses.find((c) => c.catalogId === rosterRecord.course.catalogId) ||
    new Course();
  const sections = state.resources[ResourceKey.Sections] as Section[];
  const student = users.find((u) => u.username === username) || new User();
  const section =
    sections.find(
      ({ courseId, title }) => courseId === course.id && title === sectionTitle
    ) || new Section();
  return {
    id: rosterRecord.id,
    student,
    course: {
      title: courseTitle,
      section: sectionTitle,
      catalogId: course.catalogId,
      instructor: section.instructor,
    },
  };
};
