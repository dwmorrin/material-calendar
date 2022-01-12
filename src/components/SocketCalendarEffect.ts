import { EffectCallback } from "react";
import { ResourceKey } from "../resources/types";
import { CalendarAction, CalendarState, Action } from "./types";
import User from "../resources/User";
import Event from "../resources/Event";
import Project from "../resources/Project";
import { SocketState } from "./SocketProvider";

interface SocketCalendarEffectProps extends SocketState {
  dispatch: (action: Action) => void;
  state: CalendarState;
  setSocketState: (state: Record<string, unknown>) => void;
  user: User;
}

const SocketCalendarEffect =
  ({
    eventsChanged,
    dispatch,
    state,
    setSocketState,
    user,
    eventLocked,
    eventUnlocked,
    eventLockId,
    reservationChangePayload,
    reservationChanged,
  }: SocketCalendarEffectProps) =>
  (): ReturnType<EffectCallback> => {
    if (eventsChanged) {
      // TODO: limit the number of events fetched and updated
      // current approach is brute force - reload ALL events
      // when the total number of events becomes large, this could be bad
      // the socket message can include info like a range of dates,
      // and then this can check if the calendar is currently in that range
      fetch(Event.url)
        .then((res) => res.json())
        .then(({ error, data }) => {
          if (error)
            return dispatch({ type: CalendarAction.Error, payload: { error } });
          if (!data)
            return dispatch({
              type: CalendarAction.Error,
              payload: { error: new Error("No event data") },
            });
          setSocketState({ eventsChanged: false });
          dispatch({
            type: CalendarAction.ReceivedResource,
            meta: ResourceKey.Events,
            payload: {
              resources: {
                ...state.resources,
                [ResourceKey.Events]: (data as Event[]).map(
                  (event) => new Event(event)
                ),
              },
            },
          });
        })
        .catch((error) =>
          dispatch({ type: CalendarAction.Error, payload: { error } })
        );
    }
    if (eventLocked) {
      setSocketState({ eventLocked: false });
      dispatch({
        type: CalendarAction.EventLock,
        meta: eventLockId,
      });
    }
    if (eventUnlocked) {
      setSocketState({ eventUnlocked: false });
      dispatch({
        type: CalendarAction.EventUnlock,
        meta: eventLockId,
      });
    }
    if (reservationChanged) {
      setSocketState({ reservationChanged: false });
      const { eventId, groupId, projectId, reservationId } =
        reservationChangePayload;
      const projects = user.projects.filter((p) => p.id === projectId);
      if (projects.length) {
        // fetch and update project info
        fetch(`${Project.url}/${projectId}`)
          .then((res) => res.json())
          .then(({ error, data }) => {
            if (error)
              return dispatch({
                type: CalendarAction.Error,
                payload: { error },
              });
            if (!data)
              return dispatch({
                type: CalendarAction.Error,
                payload: { error: new Error("No project data") },
              });
            dispatch({
              type: CalendarAction.UpdatedOneProject,
              payload: {
                resources: {
                  [ResourceKey.Projects]: [new Project(data as Project)],
                },
              },
            });
          })
          .catch((error) =>
            dispatch({ type: CalendarAction.Error, payload: { error } })
          );
        // fetch and update group info, if user is a member of the group
        // ... maybe this can be done in the same request as the project
      }
      // fetch and update event info
      // TODO constrain to events in the current calendar view
      fetch(`${Event.url}/${eventId}`)
        .then((res) => res.json())
        .then(({ error, data }) => {
          if (error)
            return dispatch({
              type: CalendarAction.Error,
              payload: { error },
            });
          if (!data)
            return dispatch({
              type: CalendarAction.Error,
              payload: { error: new Error("no updated event data received") },
            });
          dispatch({
            type: CalendarAction.UpdatedOneEvent,
            payload: {
              resources: {
                [ResourceKey.Events]: [new Event(data as Event)],
              },
            },
          });
        })
        .catch((error) =>
          dispatch({ type: CalendarAction.Error, payload: { error } })
        );
      // TODO reservation info? Who needs it? TBD
    }
  };

export default SocketCalendarEffect;
