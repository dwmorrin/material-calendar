import Course from "../../resources/Course";
import { AdminState, FormValues } from "../types";
import { deleteKeys } from "../../utils/deleteKeys";

export const values = (state: AdminState): FormValues => {
  const course = state.resourceInstance as Course;
  return { ...course };
};

export const update = (state: AdminState, values: FormValues): Course => {
  const course = new Course(state.resourceInstance as Course);
  return {
    ...course,
    ...deleteKeys(values, "__options__"),
  };
};
