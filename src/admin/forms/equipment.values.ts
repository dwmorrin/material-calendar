import Equipment from "../../resources/Equipment";
import { AdminState } from "../types";

export const values = (state: AdminState): Record<string, unknown> => {
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
