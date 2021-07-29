import UserGroup from "../../resources/UserGroup";
import { AdminState } from "../types";

export const values = (state: AdminState): Record<string, unknown> => {
  const group = state.resourceInstance as UserGroup;
  return { ...group };
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): UserGroup => {
  const group = new UserGroup(state.resourceInstance as UserGroup);
  return { ...group, ...values };
};
