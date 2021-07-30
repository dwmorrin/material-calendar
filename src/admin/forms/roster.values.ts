import RosterRecord from "../../resources/RosterRecord";
import User from "../../resources/User";
import Course from "../../resources/Course";
import { ResourceKey } from "../../resources/types";
import { AdminState } from "../types";

interface RosterValues extends Record<string, unknown> {
  username: string;
  course: string;
  section: string;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const rosterRecord = state.resourceInstance as RosterRecord;
  return {
    username: rosterRecord.student.username,
    course: rosterRecord.course.title,
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
  const sections = state.resources[ResourceKey.Courses] as Course[];
  const student = users.find((u) => u.username === username) || new User();
  const course =
    sections.find(
      ({ title, section }) => title === courseTitle && section === sectionTitle
    ) || new Course();
  return {
    id: rosterRecord.id,
    student,
    course,
  };
};
