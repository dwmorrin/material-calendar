import Reservation from "../../resources/Reservation";
import { AdminState, FormValues } from "../types";

export const values = (state: AdminState): FormValues => {
  const reservation = state.resourceInstance as Reservation;
  return {
    ...reservation,
    cancellation: reservation.cancellation || {},
  };
};

export const update = (state: AdminState, values: FormValues): Reservation => {
  const reservation = new Reservation(state.resourceInstance as Reservation);
  return { ...reservation, ...values };
};
