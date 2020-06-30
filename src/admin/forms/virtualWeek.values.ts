import VirtualWeek from "../../resources/VirtualWeek";
import { AdminState, FormValues } from "../types";

export const values = (state: AdminState): FormValues => {
  const virtualWeek = state.resourceInstance as VirtualWeek;
  return { ...virtualWeek };
};

export const update = (state: AdminState, values: FormValues): VirtualWeek => {
  const virtualWeek = new VirtualWeek(state.resourceInstance as VirtualWeek);
  return { ...virtualWeek, ...values };
};
