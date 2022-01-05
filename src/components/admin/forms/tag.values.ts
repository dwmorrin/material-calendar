import Tag from "../../../resources/Tag";
import { AdminState } from "../types";

export const values = (state: AdminState): Record<string, unknown> => {
  return { ...(state.resourceInstance as Tag) };
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Tag => {
  return { ...(state.resourceInstance as Tag), ...values };
};
