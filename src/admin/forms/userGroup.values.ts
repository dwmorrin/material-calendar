import UserGroup from "../../resources/UserGroup";
import { AdminState, FormValues } from "../types";
import { deleteKeys } from "../../utils/deleteKeys";

export const values = (state: AdminState): FormValues => {
  const group = state.resourceInstance as UserGroup;
  return { ...group };
};

export const update = (state: AdminState, values: FormValues): UserGroup => {
  const group = new UserGroup(state.resourceInstance as UserGroup);
  return { ...group, ...deleteKeys(values, "__options__") };
};
