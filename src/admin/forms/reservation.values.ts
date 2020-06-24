import Reservation from "../../resources/Reservation";
import { AdminState, FormValues } from "../types";
import { ResourceKey } from "../../resources/types";
import { deleteKeys } from "../../utils/deleteKeys";

export const values = (state: AdminState): FormValues => {
  const reservation = state.resourceInstance as Reservation;
  return {
    ...reservation,
    cancellation: reservation.cancellation || {},
    __options__: {
      events: state.resources[ResourceKey.Events],
      projects: state.resources[ResourceKey.Projects],
    },
  };
};

export const update = (state: AdminState, values: FormValues): Reservation => {
  const reservation = new Reservation(state.resourceInstance as Reservation);
  return { ...reservation, ...deleteKeys(values, "__options__") };
};
