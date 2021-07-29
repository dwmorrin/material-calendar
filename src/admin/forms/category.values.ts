import Category from "../../resources/Category";
import { AdminState } from "../types";

export const values = (state: AdminState): Record<string, unknown> => {
  const category = state.resourceInstance as Category;
  return { ...category };
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Category => {
  const category = new Category(state.resourceInstance as Category);
  return { ...category, ...values };
};
