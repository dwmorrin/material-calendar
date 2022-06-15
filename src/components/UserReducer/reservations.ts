import { CalendarAction } from "../types";
import { StateHandler } from "./types";
import displayMessage from "./displayMessage";
import { ResourceKey } from "../../resources/types";
import Event from "../../resources/Event";
import Project from "../../resources/Project";
import UserGroup from "../../resources/UserGroup";
import { impossibleState, missingResource } from "./errorRedirect";
import Reservation from "../../resources/Reservation";
import arrayUpdateAt from "./arrayUpdateAt";

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

export const receivedAdminReservationUpdate: StateHandler = (state, action) => {
  const { payload } = action;
  const resources = payload?.resources;
  if (!resources)
    return missingResource(
      state,
      action,
      "missing resources after reservation update"
    );

  // unpack all the updated resources
  const event = resources[ResourceKey.Events][0] as Event;
  const reservation = resources[ResourceKey.Reservations][0];
  const group = resources[ResourceKey.Groups][0] as UserGroup;
  const project = resources[ResourceKey.Projects][0] as Project;
  if (!event || !reservation || !group || !project)
    return missingResource(
      state,
      action,
      "missing event, reservation, group, or project"
    );

  const events = state.resources[ResourceKey.Events] as Event[];
  const eventIndex = events.findIndex(({ id }) => id === event.id);
  if (eventIndex === -1)
    return impossibleState(state, action, "missing reservation event");

  const reservations = state.resources[ResourceKey.Reservations];
  const reservationIndex = reservations.findIndex(
    ({ id }) => id === reservation.id
  );
  // if the reservation is not found, it's a new reservation

  return displayMessage(
    {
      ...state,
      resources: {
        ...state.resources,
        [ResourceKey.Events]: arrayUpdateAt(events, eventIndex, event),
        [ResourceKey.Reservations]: arrayUpdateAt(
          reservations,
          reservationIndex,
          reservation
        ),
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

export const receivedReservationUpdate: StateHandler = (state, action) => {
  const { payload } = action;
  const resources = payload?.resources;
  if (!resources)
    return missingResource(
      state,
      action,
      "missing resources after reservation update"
    );

  // unpack all the updated resources
  const event = resources[ResourceKey.Events][0] as Event;
  const reservation = resources[ResourceKey.Reservations][0];
  const group = resources[ResourceKey.Groups][0] as UserGroup;
  const project = resources[ResourceKey.Projects][0] as Project;
  if (!event || !reservation || !group || !project)
    return missingResource(
      state,
      action,
      "missing event, reservation, group, or project"
    );

  const events = state.resources[ResourceKey.Events] as Event[];
  const eventIndex = events.findIndex(({ id }) => id === event.id);
  if (eventIndex === -1)
    return impossibleState(state, action, "missing reservation event");

  const reservations = state.resources[ResourceKey.Reservations];
  const reservationIndex = reservations.findIndex(
    ({ id }) => id === reservation.id
  );
  // if the reservation is not found, it's a new reservation

  const projects = state.resources[ResourceKey.Projects] as Project[];
  const projectIndex = projects.findIndex(({ id }) => id === project.id);
  if (projectIndex === -1)
    return impossibleState(state, action, "missing reservation project");

  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const groupIndex = groups.findIndex(({ id }) => id === group.id);
  if (groupIndex === -1)
    return impossibleState(state, action, "missing reservation group");

  return displayMessage(
    {
      ...state,
      resources: {
        ...state.resources,
        [ResourceKey.Events]: arrayUpdateAt(events, eventIndex, event),
        [ResourceKey.Reservations]: arrayUpdateAt(
          reservations,
          reservationIndex,
          reservation
        ),
        [ResourceKey.Groups]: arrayUpdateAt(groups, groupIndex, group),
        [ResourceKey.Projects]: arrayUpdateAt(projects, projectIndex, project),
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

export const updatedOneReservation: StateHandler = (state, action) => {
  if (!action.payload?.resources)
    return missingResource(state, action, "no resources");
  const reservation = action.payload.resources[
    ResourceKey.Reservations
  ][0] as Reservation;
  const reservations = state.resources[ResourceKey.Reservations];
  const index = reservations.findIndex(({ id }) => id === reservation.id);
  if (index === -1) impossibleState(state, action, "reservation not found");
  return {
    ...state,
    resources: {
      ...state.resources,
      [ResourceKey.Reservations]: arrayUpdateAt(
        reservations,
        index,
        reservation
      ),
    },
  };
};
