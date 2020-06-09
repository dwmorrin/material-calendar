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
import { CalendarAction } from "../calendar/types";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Calendar: FunctionComponent<RouteComponentProps> = () => {
  const { user } = useContext(AuthContext);
  const classes = useStyles();
  const calendarRef = useRef<FullCalendar>(null);
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ref: calendarRef,
  });

  useEffect(() => {
    if (!user?.username) return;
    fetchAllResources(
      dispatch,
      CalendarAction.ReceivedAllResources,
      `/api/events?context=${ResourceKey.Events}`,
      `/api/locations?context=${ResourceKey.Locations}`,
      `/api/equipment?context=${ResourceKey.Equipment}`,
      `/api/users/${user.username}/courses?context=${ResourceKey.Courses}`,
      `/api/users/${user.username}/groups?context=${ResourceKey.Groups}`,
      `/api/users/${user.username}/projects?context=${ResourceKey.Projects}`
    );
  }, [user]);

  return (
    (user?.username && (
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
