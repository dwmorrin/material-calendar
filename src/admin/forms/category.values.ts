import Category from "../../resources/Category";
import { AdminState, FormValues } from "../types";

export const values = (state: AdminState): FormValues => {
  const category = state.resourceInstance as Category;
  return { ...category };
};

export const update = (state: AdminState, values: FormValues): Category => {
  const category = new Category(state.resourceInstance as Category);
  return { ...category, ...values };
};
