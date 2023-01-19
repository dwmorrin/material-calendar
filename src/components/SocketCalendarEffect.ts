import { EffectCallback } from "react";
import { ResourceKey } from "../resources/types";
import { CalendarAction, CalendarState, Action } from "./types";
import { SocketState } from "./SocketProvider";
import User from "../resources/User";
import Event from "../resources/Event";
import Project from "../resources/Project";
import UserGroup from "../resources/UserGroup";
import { addEvents } from "../resources/EventsByDate";

interface SocketCalendarEffectProps extends SocketState {
  dispatch: (action: Action) => void;
  setSocketState: (state: Record<string, unknown>) => void;
  state: CalendarState;
  user: User;
}

const SocketCalendarEffect =
  ({
    dispatch,
    eventLockId,
    eventLocked,
    eventUnlocked,
    eventsChanged,
    eventsChangedIds,
    reservationChangePayload,
    reservationChanged,
    setSocketState,
    state,
  }: SocketCalendarEffectProps) =>
  (): ReturnType<EffectCallback> => {
    const onError = (error: Error): void =>
      dispatch({ type: CalendarAction.Error, payload: { error } });

    if (eventsChanged) {
      const eventIds = [...eventsChangedIds];
      setSocketState({ eventsChanged: false, eventsChangedIds: [] });
      fetch(`${Event.url}/getIds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventIds }),
      })
        .then((res) => res.json())
        .then(({ error, data }) => {
          if (error) return onError(error);
          if (!data) return onError(new Error("No event data"));
          const updatedEvents = (data.events as Event[]).map(
            (event) => new Event(event)
          );
          const events = state.resources[ResourceKey.Events] as Event[];
          for (const event of updatedEvents) {
            const index = events.findIndex((e) => e.id === event.id);
            if (index === -1) events.push(event);
            else events[index] = event;
          }
          dispatch({
            type: CalendarAction.ReceivedResource,
            meta: ResourceKey.Events,
            payload: {
              events: addEvents(state.events, updatedEvents),
              resources: {
                ...state.resources,
                [ResourceKey.Events]: events,
              },
            },
          });
        })
        .catch(onError);
    } else if (eventLocked) {
      setSocketState({ eventLocked: false });
      dispatch({
        type: CalendarAction.EventLock,
        meta: eventLockId,
      });
    } else if (eventUnlocked) {
      setSocketState({ eventUnlocked: false });
      dispatch({
        type: CalendarAction.EventUnlock,
        meta: eventLockId,
      });
    } else if (reservationChanged) {
      setSocketState({ reservationChanged: false });
      const { eventIds, groupId, projectId } = reservationChangePayload;
      const projectFetch = fetch(`${Project.url}/${projectId}`);
      const groupFetch = fetch(`${UserGroup.url}/${groupId}`);
      const eventFetch = fetch(`${Event.url}/getIds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventIds }),
      });
      const genericError = (): void =>
        onError(
          new Error("Server had a problem. You may want to refresh the page.")
        );

      Promise.all([eventFetch, projectFetch, groupFetch])
        .then((responses) => {
          if (responses.some(({ ok }) => !ok)) genericError();
          else
            Promise.all(responses.map((response) => response.json()))
              .then((resArray) => {
                if (!resArray.every((res) => !!res.data)) return genericError();
                const [eventRes, projectRes, groupRes] = resArray;
                const events = (eventRes.data.events as Event[]).map(
                  (e) => new Event(e)
                );
                const project = projectRes.data as Project;
                const group = groupRes.data as UserGroup;
                const projects = state.resources[
                  ResourceKey.Projects
                ] as Project[];
                const groups = state.resources[
                  ResourceKey.Groups
                ] as UserGroup[];
                const projectIndex = projects.findIndex(
                  (p) => p.id === project.id
                );
                const groupIndex = groups.findIndex((g) => g.id === group.id);
                if (projectIndex > 0) projects[projectIndex] = project;
                if (groupIndex > 0) groups[groupIndex] = group;
                dispatch({
                  type: CalendarAction.UpdatedReservationEvents,
                  payload: {
                    resources: {
                      [ResourceKey.Events]: events,
                      [ResourceKey.Groups]: groups,
                      [ResourceKey.Projects]: projects,
                    },
                  },
                });
              })
              .catch(onError);
        })
        .catch(onError);
    }
  };

export default SocketCalendarEffect;
