import Tag from "../../resources/Tag";
import { AdminState, FormValues } from "../types";

export const values = (state: AdminState): FormValues => {
  return { ...(state.resourceInstance as Tag) };
};

export const update = (state: AdminState, values: FormValues): Tag => {
  return { ...(state.resourceInstance as Tag), ...values };
};
