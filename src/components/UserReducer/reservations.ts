import { CalendarAction } from "../types";
import { StateHandler } from "./types";
import displayMessage from "./displayMessage";
import { ResourceKey } from "../../resources/types";
import Event from "../../resources/Event";

export const canceledReservation: StateHandler = (state, { payload }) => {
  return displayMessage(
    {
      ...state,
      resources: {
        ...state.resources,
        ...payload?.resources,
      },
      detailIsOpen: false,
    },
    {
      type: CalendarAction.DisplayMessage,
      payload: {
        message: "Your reservation has been canceled",
      },
    }
  );
};

export const closeReservationForm: StateHandler = (state) => ({
  ...state,
  reservationFormIsOpen: false,
});

export const closeReservationFormAdmin: StateHandler = (state) => ({
  ...state,
  reservationFormAdminIsOpen: false,
});

export const openReservationForm: StateHandler = (state) => ({
  ...state,
  reservationFormIsOpen: true,
});

export const openReservationFormAdmin: StateHandler = (state) => ({
  ...state,
  reservationFormAdminIsOpen: true,
});

export const receivedReservationCancelation: StateHandler = (
  state,
  { payload }
) => {
  return displayMessage(
    {
      ...state,
      currentEvent: payload?.currentEvent,
      resources: {
        ...state.resources,
        ...payload?.resources,
      },
      detailIsOpen: false,
      reservationFormIsOpen: false,
    },
    {
      type: CalendarAction.DisplayMessage,
      payload: {
        message: "Your Reservation has been Canceled",
      },
    }
  );
};

export const receivedReservationUpdate: StateHandler = (state, { payload }) => {
  const resources = payload?.resources;
  if (!resources) throw new Error("missing resources");
  const event = resources[ResourceKey.Events][0] as Event;
  const reservation = resources[ResourceKey.Reservations][0];
  if (!event || !reservation) throw new Error("missing event or reservation");
  const events = state.resources[ResourceKey.Events] as Event[];
  const oldEventIndex = events.findIndex(({ id }) => id === event.id);
  events[oldEventIndex] = event;
  const reservations = state.resources[ResourceKey.Reservations];
  const oldReservationIndex = reservations.findIndex(
    ({ id }) => id === reservation.id
  );
  if (oldReservationIndex === -1) reservations.push(reservation);
  else reservations[oldReservationIndex] = reservation;
  return displayMessage(
    {
      ...state,
      resources: {
        ...state.resources,
        [ResourceKey.Events]: events,
        [ResourceKey.Reservations]: reservations,
      },
      detailIsOpen: false,
      reservationFormIsOpen: false,
    },
    {
      type: CalendarAction.DisplayMessage,
      payload: {
        message: payload?.message,
      },
    }
  );
};
