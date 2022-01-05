import VirtualWeek from "../../../resources/VirtualWeek";
import { AdminState } from "../types";

export const values = (state: AdminState): Record<string, unknown> => {
  const virtualWeek = state.resourceInstance as VirtualWeek;
  return { ...virtualWeek };
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): VirtualWeek => {
  const virtualWeek = new VirtualWeek(state.resourceInstance as VirtualWeek);
  return { ...virtualWeek, ...values };
};
