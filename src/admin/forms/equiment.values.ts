import Category from "../../resources/Category";
import Equipment from "../../resources/Equipment";
import { ResourceKey } from "../../resources/types";
import { AdminState, FormValues } from "../types";
import { deleteKeys } from "../../utils/deleteKeys";

export const values = (state: AdminState): FormValues => {
  const equip = state.resourceInstance as Equipment;
  return {
    ...equip,
    tags: equip.tags.map((t) => t.title),
    category: "" + equip.category.id,
    __options__: {
      categories: state.resources[ResourceKey.Categories] as Category[],
    },
  };
};

export const update = (state: AdminState, values: FormValues): Equipment => {
  const equip = new Equipment(state.resourceInstance as Equipment);
  return { ...equip, ...deleteKeys(values, "__options__") };
};
