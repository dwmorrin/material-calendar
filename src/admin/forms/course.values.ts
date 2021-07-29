import Course from "../../resources/Course";
import { AdminState } from "../types";

export const values = (state: AdminState): Record<string, unknown> => {
  const course = state.resourceInstance as Course;
  return { ...course };
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Course => {
  const course = new Course(state.resourceInstance as Course);
  return {
    ...course,
    ...values,
  };
};
