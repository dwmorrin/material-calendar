import React, { FunctionComponent, useEffect, useReducer, useRef } from "react";
import useLocalStorage from "../utils/useLocalStorage";
import { RouteComponentProps } from "@reach/router";
import CalendarDrawer from "./Calendar/CalendarDrawer";
import CalendarBar from "./Calendar/CalendarBar";
import StaticDatePicker from "./DatePicker";
import FullCalendar from "@fullcalendar/react";
import { useAuth } from "./AuthProvider";
import reducer from "./UserReducer/reducer";
import FullCalendarBox from "./Calendar/FullCalendarBox";
import EventDetail from "./EventDetail/EventDetail";
import initialState from "./initialState";
import ProjectDashboard from "./Project/ProjectDashboard";
import { ResourceKey } from "../resources/types";
import fetchAllResources from "../utils/fetchAllResources";
import { CalendarAction, CalendarSelections } from "./types";
import { Box, Snackbar, SnackbarContent } from "@material-ui/core";
import EventEditor from "./EventEditor/EventEditor";
import ProjectForm from "./Project/ProjectForm";
import MessageSnackbar from "./Snackbar";
import ErrorPage from "./ErrorPage";
import User from "../resources/User";
import Equipment from "../resources/Equipment";
import Event from "../resources/Event";
import Location from "../resources/Location";
import UserGroup from "../resources/UserGroup";
import Category from "../resources/Category";
import Reservation from "../resources/Reservation";
import Project from "../resources/Project";
import { useSocket } from "./SocketProvider";

const UserRoot: FunctionComponent<RouteComponentProps> = () => {
  const {
    eventLockId,
    eventLocked,
    eventUnlocked,
    eventsChanged,
    refreshRequested,
    reservationChanged,
    reservationChangePayload,
    setSocketState,
  } = useSocket();
  const { user } = useAuth();
  const calendarRef = useRef<FullCalendar>(null);
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ref: calendarRef,
  });
  const [selections, setSelections] = useLocalStorage("calendar-selections", {
    locationIds: [],
    projectIds: [],
    calendarView: "resourceTimeGridWeek",
  } as CalendarSelections);

  // initial data fetch
  useEffect(() => {
    if (!user.id) return;
    fetchAllResources(
      dispatch,
      CalendarAction.ReceivedAllResources,
      CalendarAction.Error,
      `${Event.url}?context=${ResourceKey.Events}`,
      `${Location.url}?context=${ResourceKey.Locations}`,
      `${User.url}/${user.id}/courses?context=${ResourceKey.Courses}`,
      `${UserGroup.url}/user?context=${ResourceKey.Groups}`,
      `${User.url}/${user.id}/projects?context=${ResourceKey.Projects}`,
      `${Equipment.url}?context=${ResourceKey.Equipment}`,
      `${Category.url}?context=${ResourceKey.Categories}`,
      `${Reservation.url}/user?context=${ResourceKey.Reservations}`
    );
  }, [user]);

  // socket event handlers
  useEffect(() => {
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
            console.log("todo: update project info", { data });
          });
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
          console.log("TODO: update event info", { data });
          // dispatch({
          //   type: CalendarAction.ReceivedResource,
          //   meta: ResourceKey.Events,
          //   payload: {
          //     resources: {
          //       ...state.resources,
          //       [ResourceKey.Events]: [new Event(data as Event)],
          //     },
          //   },
          // });
        });
      // TODO reservation info? Who needs it? TBD
    }
  }, [
    eventsChanged,
    eventLockId,
    eventLocked,
    eventUnlocked,
    reservationChanged,
    reservationChangePayload,
    setSocketState,
    state.resources,
    user,
  ]);

  return (
    <Box>
      <ErrorPage open={state.appIsBroken} error={state.error} />
      <ProjectDashboard dispatch={dispatch} state={state} />
      <CalendarDrawer
        dispatch={dispatch}
        state={state}
        selections={selections}
        setSelections={setSelections}
      />
      <EventDetail dispatch={dispatch} state={state} />
      <ProjectForm dispatch={dispatch} state={state} />
      <EventEditor dispatch={dispatch} state={state} />
      <CalendarBar
        dispatch={dispatch}
        state={state}
        selections={selections}
        setSelections={setSelections}
      />
      {state.pickerShowing && (
        <StaticDatePicker dispatch={dispatch} state={state} />
      )}
      <FullCalendarBox
        dispatch={dispatch}
        state={state}
        selections={selections}
        setSelections={setSelections}
      />
      <MessageSnackbar
        dispatch={dispatch}
        state={state}
        action={{ type: CalendarAction.CloseSnackbar }}
      />
      <Snackbar
        open={refreshRequested}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={(): void => undefined}
      >
        <SnackbarContent message="Please refresh the page to continue." />
      </Snackbar>
    </Box>
  );
};

export default UserRoot;
