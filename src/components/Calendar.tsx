import React, { FunctionComponent, useEffect, useRef, useReducer } from "react";
import { makeStyles } from "@material-ui/core/styles";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import "@fullcalendar/core/main.css";
import "@fullcalendar/timegrid/main.css";
import {
  Box,
  List,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import TodayIcon from "@material-ui/icons/Today";
import { RouteComponentProps } from "@reach/router";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import TemporaryDrawer from "./TemporaryDrawer";
import Event from "../calendar/Event";
import Location from "../calendar/Location";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRIght: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "white",
  },
}));

const getCurrentTimeString = (): string => {
  const date = new Date();
  const timeString = date.toTimeString().split(" ")[0];
  return timeString;
};

enum CalendarAction {
  Error,
  Loading,
  ReceivedEvents,
  ReceivedLocations,
  ToggleDrawer,
  TogglePicker,
  ViewToday,
}

interface CalendarState {
  currentStart: Date;
  drawerIsOpen: boolean;
  events: Event[];
  locations: Location[];
  pickerShowing: boolean;
  ref: React.RefObject<FullCalendar> | null;
}

const initialState: CalendarState = {
  currentStart: new Date(),
  drawerIsOpen: false,
  events: [],
  locations: [],
  pickerShowing: false,
  ref: null,
};

interface Action {
  type: CalendarAction;
  payload?: {
    error?: Error;
    currentStart?: Date;
    drawerIsOpen?: boolean;
    events?: Event[];
    locations?: Location[];
    pickerShowing?: boolean;
    ref?: React.RefObject<FullCalendar> | null;
  };
  error?: boolean;
}

const reducer = (state: CalendarState, action: Action): CalendarState => {
  if (action.type === CalendarAction.ViewToday) {
    if (!state.ref || !state.ref.current) {
      throw new Error("no calendar reference");
    }
    state.ref.current.getApi().today();
    return { ...state, currentStart: new Date() };
  }

  if (action.type === CalendarAction.ReceivedEvents) {
    if (!action.payload || !action.payload.events) {
      throw new Error("no events in received events");
    }
    return {
      ...state,
      events: action.payload.events.map(
        (event) =>
          new Event(
            event.id,
            event.start,
            event.end,
            event.location,
            event.title
          )
      ),
    };
  }

  if (action.type === CalendarAction.ReceivedLocations) {
    if (!action.payload || !action.payload.locations) {
      throw new Error("no locations in received locations");
    }
    return {
      ...state,
      locations: action.payload.locations.map(
        (location) => new Location(location.name, location.name)
      ),
    };
  }

  if (action.type === CalendarAction.ToggleDrawer) {
    return { ...state, drawerIsOpen: !state.drawerIsOpen };
  }

  if (action.type === CalendarAction.TogglePicker) {
    return { ...state, pickerShowing: !state.pickerShowing };
  }

  if (action.type === CalendarAction.Error) {
    if (action.payload && action.payload.error) {
      console.error(action.payload.error);
    }
  }
  // CalendarAction.Loading
  return state;
};

const Calendar: FunctionComponent<RouteComponentProps> = () => {
  const classes = useStyles();
  const calendarRef = useRef<FullCalendar>(null);
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    ref: calendarRef,
  });
  const toggleDrawer = () => (
    event: React.KeyboardEvent | React.MouseEvent
  ): void => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    dispatch({
      type: CalendarAction.ToggleDrawer,
      payload: { drawerIsOpen: !state.drawerIsOpen },
    });
  };

  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) {
      console.error("Calendar unavailable");
      return;
    }
    const calendarApi = calendar.getApi();
    if (!calendarApi) {
      console.error("Calendar unavailable");
      return;
    }
    dispatch({
      type: CalendarAction.Loading,
    });
    calendarApi.scrollToTime(getCurrentTimeString());
    fetch("/events")
      .then((response) => response.json())
      .then((events) =>
        dispatch({
          type: CalendarAction.ReceivedEvents,
          payload: { events },
        })
      )
      .catch((error) =>
        dispatch({
          type: CalendarAction.Error,
          payload: { error },
          error: true,
        })
      );
    fetch("/locations")
      .then((response) => response.json())
      .then((locations) =>
        dispatch({
          type: CalendarAction.ReceivedLocations,
          payload: { locations },
        })
      )
      .catch((error) =>
        dispatch({
          type: CalendarAction.Error,
          payload: { error },
          error: true,
        })
      );
  }, []);

  const handleClickMonth = (): void => {
    dispatch({
      type: CalendarAction.TogglePicker,
      payload: { pickerShowing: !state.pickerShowing },
    });
  };
  const handleClickToday = (): void => {
    dispatch({ type: CalendarAction.ViewToday });
  };
  return (
    <div className={classes.root}>
      <div>
        <TemporaryDrawer
          onClick={(): void => dispatch({ type: CalendarAction.ToggleDrawer })}
          onKeyDown={(): void =>
            console.log("TODO: add key handler for TemporaryDrawer")
          }
          open={state.drawerIsOpen}
          onOpen={toggleDrawer}
          onClose={toggleDrawer}
        />
      </div>
      <AppBar position="sticky">
        <List>
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer()}
            >
              <MenuIcon />
            </IconButton>
            <Button className={classes.title} onClick={handleClickMonth}>
              <Typography component="h6">
                {state.currentStart.toLocaleString("default", {
                  month: "long",
                })}
              </Typography>
            </Button>
            <IconButton onClick={handleClickToday}>
              <TodayIcon />
            </IconButton>
            <IconButton>
              <MoreVertIcon />
            </IconButton>
          </Toolbar>
        </List>
      </AppBar>
      {state.pickerShowing && (
        <Box>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
              value={state.currentStart}
              onChange={handleClickMonth}
            />
          </MuiPickersUtilsProvider>
        </Box>
      )}
      {!state.pickerShowing && (
        <Box>
          <FullCalendar
            ref={calendarRef}
            header={false}
            allDaySlot={false}
            nowIndicator={true}
            height="auto"
            defaultView="resourceTimeGridDay"
            plugins={[resourceTimeGridPlugin]}
            events={state.events}
            resources={state.locations}
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
          />
        </Box>
      )}
    </div>
  );
};

export default Calendar;
