import Equipment from "../../resources/Equipment";
import { AdminState, FormValues } from "../types";

export const values = (state: AdminState): FormValues => {
  const equip = state.resourceInstance as Equipment;
  return { ...equip };
};

export const update = (state: AdminState, values: FormValues): Equipment => {
  const equip = new Equipment(state.resourceInstance as Equipment);
  return { ...equip, ...values };
};
