import Semester from "../../resources/Semester";
import { AdminState, FormValues } from "../types";

export const values = (state: AdminState): FormValues => {
  const semester = state.resourceInstance as Semester;
  return { ...semester };
};

export const update = (state: AdminState, values: FormValues): Semester => {
  const semester = new Semester(state.resourceInstance as Semester);
  return { ...semester, ...values };
};
