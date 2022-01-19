import { CalendarState, Action } from "../types";
import { ResourceKey } from "../../resources/types";
import { StateHandler } from "./types";

import Event from "../../resources/Event";

import { impossibleState, missingResource } from "./errorRedirect";
import { receivedResource } from "./resources";
import arrayUpdateAt from "./arrayUpdateAt";

//***** HELPER FUNCTIONS

const mergeEvents = (events: Event[], event: Event, index: number): Event[] =>
  arrayUpdateAt<Event>(events, index, event);

const getEventIndex: (s: CalendarState, e: Event) => number = (state, e) => {
  const events = state.resources[ResourceKey.Events] as Event[];
  return events.findIndex(({ id }) => id === e.id);
};

// returns [error, event[]]: check for error
const getMergedEvents: (s: CalendarState, e: Event) => [boolean, Event[]] = (
  state,
  e
) => {
  const events = state.resources[ResourceKey.Events] as Event[];
  const index = getEventIndex(state, e);
  if (index < 0) return [true, events];
  return [false, mergeEvents(events, e, index)];
};

//***** END HELPER FUNCTIONS

export const closeEventDetail: StateHandler = (state) => ({
  ...state,
  detailIsOpen: false,
});

export const closeEventEditor: StateHandler = (state) => ({
  ...state,
  eventEditorIsOpen: false,
});

export const createdEventsReceived: StateHandler = (state, action) => {
  return closeEventEditor(receivedResource(state, action), action);
};

const eventLockHandler = (
  kind: "lock" | "unlock",
  state: CalendarState,
  action: Action
): CalendarState => {
  const { meta } = action;
  if (typeof meta !== "number")
    return missingResource(state, action, `No event id to ${kind}`);
  const events = state.resources[ResourceKey.Events] as Event[];
  const eventIndex = events.findIndex((e) => e.id === meta);
  if (eventIndex < 0) return missingResource(state, action, "No event found");
  const event = new Event({
    ...events[eventIndex],
    locked: kind === "lock",
  });
  const currentEvent =
    event.id === state.currentEvent?.id ? event : state.currentEvent;
  return {
    ...state,
    currentEvent,
    resources: {
      ...state.resources,
      [ResourceKey.Events]: mergeEvents(events, event, eventIndex),
    },
  };
};

export const eventLock: StateHandler = (state, action) =>
  eventLockHandler("lock", state, action);
export const eventUnlock: StateHandler = (state, action) =>
  eventLockHandler("unlock", state, action);

export const foundStaleCurrentEvent: StateHandler = (state, { payload }) => {
  if (payload?.currentEvent instanceof Event) {
    const event = payload?.currentEvent as Event;
    const events = state.resources[ResourceKey.Events] as Event[];
    const index = events.findIndex(({ id }) => id === event.id);
    return {
      ...state,
      currentEvent: event,
      resources: {
        ...state.resources,
        [ResourceKey.Events]: mergeEvents(events, event, index),
      },
    };
  }
  return state;
};

export const openEventDetail: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentEvent) {
    return missingResource(state, action, "no event received for detail view");
  }
  return {
    ...state,
    detailIsOpen: true,
    currentEvent: payload.currentEvent,
  };
};

export const openEventEditor: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentEvent) {
    return missingResource(state, action, "no event received for event editor");
  }
  return {
    ...state,
    eventEditorIsOpen: true,
    currentEvent: payload.currentEvent,
  };
};

export const selectedEvent: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentEvent) {
    return missingResource(
      state,
      action,
      "no event received for selecting Event"
    );
  }
  return {
    ...state,
    currentEvent: payload.currentEvent,
  };
};

export const deletedOneEvent: StateHandler = (state, action) => {
  if (typeof action.meta !== "number")
    return missingResource(state, action, "no event id");
  const events = state.resources[ResourceKey.Events] as Event[];
  const index = events.findIndex(({ id }) => id === action.meta);
  if (index < 0) return missingResource(state, action, "no event found");
  return {
    ...state,
    currentEvent: undefined,
    eventEditorIsOpen: false,
    resources: {
      ...state.resources,
      [ResourceKey.Events]: [
        ...events.slice(0, index),
        ...events.slice(index + 1),
      ],
    },
  };
};

export const updatedOneEvent: StateHandler = (state, action) => {
  if (!action.payload?.resources)
    return missingResource(state, action, "no payload");
  const event = action.payload.resources[ResourceKey.Events][0] as Event;
  const [err, events] = getMergedEvents(state, event);
  if (err) return impossibleState(state, action, "non-existent event");
  return {
    ...state,
    currentEvent:
      state.currentEvent?.id === event.id ? event : state.currentEvent,
    resources: {
      ...state.resources,
      [ResourceKey.Events]: events,
    },
  };
};

export const updatedEventReceived: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload) return missingResource(state, action, "no payload");
  const { currentEvent } = payload;
  if (!currentEvent)
    return missingResource(state, action, "no event after update");
  const [err, mergedEvents] = getMergedEvents(state, currentEvent);
  if (err) return impossibleState(state, action, "non-existent event");
  return closeEventEditor(
    selectedEvent(
      {
        ...receivedResource(state, {
          ...action,
          payload: {
            resources: {
              [ResourceKey.Events]: mergedEvents,
            },
          },
        }),
        currentEvent: action.payload?.currentEvent,
      },
      action
    ),
    action
  );
};
