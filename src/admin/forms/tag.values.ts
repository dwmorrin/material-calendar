import Tag from "../../resources/Tag";
import { AdminState, FormValues } from "../types";

export const values = (state: AdminState): FormValues => {
  const category = state.resourceInstance as Tag;
  return { ...category };
};

export const update = (state: AdminState, values: FormValues): Tag => {
  const tag = new Tag(state.resourceInstance as Tag);
  return { ...tag, ...values };
};
