import { CalendarState, Action } from "../types";
import { ResourceKey } from "../../resources/types";
import { StateHandler } from "./types";

import Event from "../../resources/Event";

import { missingResource } from "./errorRedirect";
import { receivedResource } from "./resources";
import arrayUpdateAt from "./arrayUpdateAt";
import { addEvents, removeEvent } from "../../resources/EventsByDate";

export const closeEventDetail: StateHandler = (state) => ({
  ...state,
  detailIsOpen: false,
});

export const closeEventEditor: StateHandler = (state) => ({
  ...state,
  eventEditorIsOpen: false,
});

export const createdEventsReceived: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload)
    return missingResource(state, action, "no created events received");
  const { resources } = payload;
  if (!(resources && Array.isArray(resources[ResourceKey.Events])))
    return missingResource(state, action, "no created events received");
  const e = resources[ResourceKey.Events] as Event[];
  //! this new array may have duplicates
  const newEventArray = [
    ...state.resources[ResourceKey.Events],
    ...resources[ResourceKey.Events],
  ];
  // newEvents will not have duplicates
  const newEvents = addEvents(state.events, e);
  return closeEventEditor(
    {
      ...state,
      events: newEvents,
      resources: {
        ...state.resources,
        [ResourceKey.Events]: newEventArray,
      },
    },
    action
  );
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
  if (eventIndex < 0) {
    // nothing to update
    return state;
  }
  const event = new Event({
    ...events[eventIndex],
    locked: kind === "lock",
  });
  const currentEvent =
    event.id === state.currentEvent?.id ? event : state.currentEvent;
  return {
    ...state,
    events: addEvents(state.events, [event]),
    currentEvent,
    resources: {
      ...state.resources,
      [ResourceKey.Events]: arrayUpdateAt(events, eventIndex, event),
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
    const eventArray = state.resources[ResourceKey.Events] as Event[];
    const index = eventArray.findIndex(({ id }) => id === event.id);
    return {
      ...state,
      events: addEvents(state.events, [event]),
      currentEvent: event,
      resources: {
        ...state.resources,
        [ResourceKey.Events]: arrayUpdateAt(eventArray, index, event),
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
    events: removeEvent(state.events, events[index]),
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

export const updatedReservationEvents: StateHandler = (state, action) => {
  if (!action.payload?.resources)
    return missingResource(state, action, "no payload");
  const updatedEvents = action.payload.resources[ResourceKey.Events] as Event[];
  const events = state.resources[ResourceKey.Events] as Event[];
  const eventIdMap: Record<number, Event> = {};
  for (const event of updatedEvents) {
    const index = events.findIndex(({ id }) => id === event.id);
    if (index === -1) events.push(event);
    else events[index] = event;
    eventIdMap[event.id] = event;
  }
  let currentEvent = state.currentEvent;
  if (currentEvent && currentEvent.id in eventIdMap)
    currentEvent = eventIdMap[currentEvent.id];
  return {
    ...state,
    currentEvent,
    events: addEvents(state.events, updatedEvents),
    resources: {
      ...state.resources,
      ...action.payload.resources, // projects, groups
      [ResourceKey.Events]: [...events],
    },
  };
};

export const updatedEventReceived: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload) return missingResource(state, action, "no payload");
  const { currentEvent } = payload;
  if (!currentEvent)
    return missingResource(state, action, "no event after update");
  const events = state.resources[ResourceKey.Events] as Event[];
  const index = events.findIndex(({ id }) => id === currentEvent.id);
  return closeEventEditor(
    selectedEvent(
      {
        ...receivedResource(state, {
          ...action,
          payload: {
            events: addEvents(state.events, [currentEvent]),
            resources: {
              [ResourceKey.Events]: arrayUpdateAt(events, index, currentEvent),
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
