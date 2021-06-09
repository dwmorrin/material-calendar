import Equipment from "../../resources/Equipment";
import { AdminState, FormValues } from "../types";

export const values = (state: AdminState): FormValues => {
  const equip = state.resourceInstance as Equipment;
  return {
    ...equip,
    tags: equip.tags.map((t) => t.title),
    category: "" + equip.category.id,
  };
};

export const update = (state: AdminState): Equipment => {
  return new Equipment(state.resourceInstance as Equipment);
};
