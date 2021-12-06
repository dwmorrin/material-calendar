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
    courses.find((c) => c.id === rosterRecord.section.courseId) || new Course();
  return {
    username: rosterRecord.student.username,
    course: course.title,
    section: rosterRecord.section.title,
  } as RosterValues;
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): RosterRecord => {
  const rosterRecord = state.resourceInstance as RosterRecord;
  const { username, course: courseTitle } = values as RosterValues;
  const users = state.resources[ResourceKey.Users] as User[];
  const sections = state.resources[ResourceKey.Sections] as Section[];
  const student = users.find((u) => u.username === username) || new User();
  const section =
    sections.find(({ id }) => id === rosterRecord.section.id) || new Section();
  return {
    id: rosterRecord.id,
    student,
    section,
  };
};
