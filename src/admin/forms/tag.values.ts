import Tag from "../../resources/Tag";
import { AdminState, FormValues } from "../types";
import { ResourceKey } from "../../resources/types";

export const values = (state: AdminState): FormValues => {
  const tag = state.resourceInstance as Tag;
  return { ...tag, categories: state.resources[ResourceKey.Categories] };
};

export const update = (state: AdminState, values: FormValues): Tag => {
  const tag = new Tag(state.resourceInstance as Tag);
  delete values.categories;
  return { ...tag, ...values };
};
