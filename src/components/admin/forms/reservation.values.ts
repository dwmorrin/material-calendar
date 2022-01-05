import Reservation, {
  ReservationCancelation,
} from "../../../resources/Reservation";
import { AdminState } from "../types";

interface ReservationFormValues extends Record<string, unknown> {
  id: number;
  description: string;
  eventId: string;
  projectId: string;
  groupId: string;
  guests: string;
  cancellation: ReservationCancelation;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const reservation = state.resourceInstance as Reservation;
  return {
    id: reservation.id,
    description: reservation.description,
    eventId: String(reservation.eventId),
    projectId: String(reservation.projectId),
    groupId: String(reservation.groupId),
    cancellation: reservation.cancelation || {},
  } as ReservationFormValues;
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Reservation => {
  const reservation = new Reservation(state.resourceInstance as Reservation);
  const { description, eventId, projectId, groupId, guests, cancellation } =
    values as ReservationFormValues;
  return {
    ...reservation,
    description,
    eventId: Number(eventId),
    projectId: Number(projectId),
    groupId: Number(groupId),
    guests,
    cancelation: cancellation,
  };
};
