import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import useLocalStorage from "../calendar/useLocalStorage";
import { RouteComponentProps, Redirect } from "@reach/router";
import CalendarDrawer from "./CalendarDrawer";
import CalendarBar from "./CalendarBar";
import StaticDatePicker from "./DatePicker";
import FullCalendar from "@fullcalendar/react";
import { AuthContext } from "./AuthContext";
import reducer from "../calendar/reducer";
import FullCalendarBox from "./FullCalendarBox";
import EventDetail from "./EventDetail";
import initialState from "../calendar/initialState";
import ProjectDashboard from "./ProjectDashboard";
import { ResourceKey } from "../resources/types";
import fetchAllResources from "../utils/fetchAllResources";
import { CalendarAction, CalendarSelections } from "../calendar/types";
import { Box } from "@material-ui/core";
import EventEditor from "./EventEditor";
import ProjectForm from "./ProjectForm";
import Snackbar from "./Snackbar";
import ErrorPage from "./ErrorPage";
import User from "../resources/User";
import Event from "../resources/Event";
import Location from "../resources/Location";
import UserGroup from "../resources/UserGroup";

const Calendar: FunctionComponent<RouteComponentProps> = () => {
  const { user, loggedOut } = useContext(AuthContext);
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

  const dispatchError = (error: Error, context = ""): void =>
    dispatch({
      type: CalendarAction.Error,
      payload: { error },
      meta: context,
    });

  useEffect(() => {
    if (loggedOut || !user.username) return;
    fetchAllResources(
      dispatch,
      CalendarAction.ReceivedAllResources,
      CalendarAction.Error,
      `${Event.url}?context=${ResourceKey.Events}`,
      `${Location.url}?context=${ResourceKey.Locations}`,
      `${User.url}/${user.id}/courses?context=${ResourceKey.Courses}`,
      `${UserGroup.url}/user/${user.id}/?context=${ResourceKey.Groups}`,
      `${User.url}/${user.id}/projects?context=${ResourceKey.Projects}`
    );
    fetch(`/api/invitations/user/${user?.id}/`)
      .then((response) => response.json())
      .then(({ error, data, context }) => {
        if (error || !data) return dispatchError(error, context);
        dispatch({
          type: CalendarAction.ReceivedInvitations,
          payload: {
            invitations: data,
          },
        });
      })
      .catch(dispatchError);
  }, [user, loggedOut]);

  return (
    (!loggedOut && !!user.username && (
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
        <EventEditor
          dispatch={dispatch}
          open={state.eventEditorIsOpen}
          event={state.currentEvent}
        />
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
        <Snackbar
          dispatch={dispatch}
          state={state}
          action={{ type: CalendarAction.CloseSnackbar }}
        />
      </Box>
    )) || <Redirect to="/" replace={true} noThrow={true} />
  );
};

export default Calendar;
