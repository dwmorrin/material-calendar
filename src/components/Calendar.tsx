import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useReducer,
  useRef,
} from "react";
import { makeStyles } from "@material-ui/core/styles";
import { RouteComponentProps, Redirect } from "@reach/router";
import TemporaryDrawer from "./TemporaryDrawer";
import { CalendarAction } from "../calendar/types";
import CalendarBar from "./CalendarBar";
import StaticDatePicker from "./DatePicker";
import FullCalendar from "@fullcalendar/react";
import { AuthContext } from "./AuthContext";
import { fetchCalendarData } from "../calendar/Fetch";
import calendarReducer from "../calendar/Reducer";
import FullCalendarBox from "./FullCalendarBox";
import EventDetail from "./EventDetail";
import initialState from "../calendar/initialCalendarState";
import ProjectDashboard from "./ProjectDashboard";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Calendar: FunctionComponent<RouteComponentProps> = () => {
  const { user } = useContext(AuthContext);
  const classes = useStyles();
  const calendarRef = useRef<FullCalendar>(null);
  const [state, dispatch] = useReducer(calendarReducer, {
    ...initialState,
    ref: calendarRef,
  });

  useEffect(() => {
    if (!user?.id) return;
    fetchCalendarData({
      url: "/api/events",
      dispatch,
      onSuccessAction: CalendarAction.ReceivedEvents,
      payloadKey: "events",
    });
    fetchCalendarData({
      url: "/api/locations",
      dispatch,
      onSuccessAction: CalendarAction.ReceivedLocations,
      payloadKey: "locations",
    });
    fetchCalendarData({
      url: "/api/projects",
      dispatch,
      onSuccessAction: CalendarAction.ReceivedProjects,
      payloadKey: "projects",
    });
  }, [user]);

  return (
    (user?.id && (
      <div className={classes.root}>
        <ProjectDashboard dispatch={dispatch} state={state} />
        <TemporaryDrawer dispatch={dispatch} state={state} />
        <EventDetail dispatch={dispatch} state={state} />
        <CalendarBar dispatch={dispatch} state={state} />
        {state.pickerShowing && (
          <StaticDatePicker dispatch={dispatch} state={state} />
        )}
        <FullCalendarBox dispatch={dispatch} state={state} />
      </div>
    )) || <Redirect to="/" replace={true} noThrow={true} />
  );
};

export default Calendar;
