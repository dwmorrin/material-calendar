import { EffectCallback } from "react";
import { ResourceKey } from "../resources/types";
import { CalendarAction, CalendarState, Action } from "./types";
import { SocketState } from "./SocketProvider";
import User from "../resources/User";
import Event from "../resources/Event";
import Project from "../resources/Project";
import UserGroup from "../resources/UserGroup";
import Reservation from "../resources/Reservation";

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
    reservationChangePayload,
    reservationChanged,
    setSocketState,
    state,
    user,
  }: SocketCalendarEffectProps) =>
  (): ReturnType<EffectCallback> => {
    const onError = (error: Error): void =>
      dispatch({ type: CalendarAction.Error, payload: { error } });

    if (eventsChanged) {
      setSocketState({ eventsChanged: false });
      // TODO: limit the number of events fetched and updated
      // current approach is brute force - reload ALL events
      // when the total number of events becomes large, this could be bad
      // the socket message can include info like a range of dates,
      // and then this can check if the calendar is currently in that range
      fetch(Event.url)
        .then((res) => res.json())
        .then(({ error, data }) => {
          if (error) return onError(error);
          if (!data) return onError(new Error("No event data"));
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
        .catch(onError);
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
      // Only update the project if the user is a member of the project
      if (projects.length) {
        // fetch and update project info
        fetch(`${Project.url}/${projectId}`)
          .then((res) => res.json())
          .then(({ error, data }) => {
            if (error) return onError(error);
            if (!data) return onError(new Error("No project data"));
            dispatch({
              type: CalendarAction.UpdatedOneProject,
              payload: {
                resources: {
                  [ResourceKey.Projects]: [new Project(data as Project)],
                },
              },
            });
          })
          .catch(onError);
        const group = (
          state.resources[ResourceKey.Groups] as UserGroup[]
        ).filter((g) => g.id === groupId);
        // only update the group if the user is a member of the group
        if (group) {
          fetch(`${UserGroup.url}/${groupId}`)
            .then((res) => res.json())
            .then(({ error, data }) => {
              if (error) return onError(error);
              if (!data) return onError(new Error("No group data"));
              dispatch({
                type: CalendarAction.UpdatedOneGroup,
                payload: {
                  resources: {
                    [ResourceKey.Groups]: [new UserGroup(data as UserGroup)],
                  },
                },
              });
            })
            .catch(onError);
        }
      }
      // fetch and update event info
      const event = (state.resources[ResourceKey.Events] as Event[]).find(
        (e) => e.id === eventId
      );
      // only if the user has the event in their current state
      if (event) {
        fetch(`${Event.url}/${eventId}`)
          .then((res) => res.json())
          .then(({ error, data }) => {
            if (error) return onError(error);
            if (!data) return onError(new Error("No event data"));
            dispatch({
              type: CalendarAction.UpdatedOneEvent,
              payload: {
                resources: {
                  [ResourceKey.Events]: [new Event(data as Event)],
                },
              },
            });
          })
          .catch(onError);
      }
      // fetch and update reservation info
      /*
      const reservations = state.resources[
        ResourceKey.Reservations
      ] as Reservation[];
      const reservation = reservations.find((r) => r.id === reservationId);
      if (reservation) {
        fetch(`${Reservation.url}/${reservationId}`)
          .then((res) => res.json())
          .then(({ error, data }) => {
            if (error) return onError(error);
            if (!data) return onError(new Error("No reservation data"));
            dispatch({
              type: CalendarAction.UpdatedOneReservation,
              payload: {
                resources: {
                  [ResourceKey.Reservations]: [
                    new Reservation(data as Reservation),
                  ],
                },
              },
            });
          })
          .catch(onError);
      }
      */
    }
  };

export default SocketCalendarEffect;
