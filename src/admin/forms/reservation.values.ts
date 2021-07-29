import Reservation from "../../resources/Reservation";
import { AdminState } from "../types";

export const values = (state: AdminState): Record<string, unknown> => {
  const reservation = state.resourceInstance as Reservation;
  return {
    ...reservation,
    cancellation: reservation.cancellation || {},
  };
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Reservation => {
  const reservation = new Reservation(state.resourceInstance as Reservation);
  return { ...reservation, ...values };
};
