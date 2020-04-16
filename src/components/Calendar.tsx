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
import { CalendarAction, CalendarState } from "../calendar/types";
import CalendarBar from "./CalendarBar";
import StaticDatePicker from "./DatePicker";
import FullCalendar from "@fullcalendar/react";
import { AuthContext } from "./AuthContext";
import { fetchCalendarData } from "../calendar/Fetch";
import calendarReducer from "../calendar/Reducer";
import FullCalendarBox from "./FullCalendarBox";
import EventDetail from "./EventDetail";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const initialState: CalendarState = {
  currentStart: new Date(),
  currentView: "resourceTimeGridDay",
  detailIsOpen: false,
  drawerIsOpen: false,
  events: [],
  loading: true,
  locations: [],
  pickerShowing: false,
  ref: null,
};

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
    fetchCalendarData(dispatch, "/events");
    fetchCalendarData(dispatch, "/locations");
  }, [user]);

  const toggleDrawer = (): void =>
    dispatch({ type: CalendarAction.ToggleDrawer });
  return (
    (user?.id && (
      <div className={classes.root}>
        <TemporaryDrawer
          dispatch={dispatch}
          state={state}
          onClick={toggleDrawer}
          onOpen={toggleDrawer}
          onClose={toggleDrawer}
          onKeyDown={toggleDrawer}
          open={state.drawerIsOpen}
        />
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
