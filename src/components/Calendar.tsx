import React, { FunctionComponent, useEffect, useReducer, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/list/main.css";
import "@fullcalendar/timegrid/main.css";
import { Box, CircularProgress } from "@material-ui/core";
import { RouteComponentProps } from "@reach/router";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import TemporaryDrawer from "./TemporaryDrawer";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import calendarReducer from "../calendar/Reducer";
import { CalendarAction, CalendarState } from "../calendar/types";
import CalendarBar from "./CalendarBar";
import { fetchCalendarData } from "../calendar/Fetch";
import { makeSelectedLocationDict } from "../calendar/Location";

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const initialState: CalendarState = {
  currentStart: new Date(),
  currentView: "resourceTimeGridDay",
  drawerIsOpen: false,
  events: [],
  loading: true,
  locations: [],
  pickerShowing: false,
  ref: null,
};

const Calendar: FunctionComponent<RouteComponentProps> = () => {
  const classes = useStyles();
  const calendarRef = useRef<FullCalendar>(null);
  const [state, dispatch] = useReducer(calendarReducer, {
    ...initialState,
    ref: calendarRef,
  });

  useEffect(() => {
    fetchCalendarData(dispatch, "/events");
    fetchCalendarData(dispatch, "/locations");
  }, []);

  return (
    <div className={classes.root}>
      <TemporaryDrawer
        dispatch={dispatch}
        state={state}
        onClick={(): void => {
          dispatch({ type: CalendarAction.ToggleDrawer });
        }}
        onOpen={(): void => dispatch({ type: CalendarAction.ToggleDrawer })}
        onClose={(): void => dispatch({ type: CalendarAction.ToggleDrawer })}
        onKeyDown={(): void => dispatch({ type: CalendarAction.ToggleDrawer })}
        open={state.drawerIsOpen}
      />
      <CalendarBar dispatch={dispatch} state={state} />
      {state.pickerShowing && (
        <Box>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker
              value={state.currentStart}
              onChange={(date: MaterialUiPickersDate): void => {
                dispatch({
                  type: CalendarAction.PickedDate,
                  payload: { currentStart: date?.toDate() },
                });
              }}
              variant="static"
            />
          </MuiPickersUtilsProvider>
        </Box>
      )}
      {!state.pickerShowing && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flex="1"
          height="93vh" // important for FullCalendar sticky header & scrolling
        >
          {state.loading && <CircularProgress />}
          {!state.loading && (
            <FullCalendar
              ref={calendarRef}
              defaultDate={state.currentStart}
              header={false}
              allDaySlot={false}
              nowIndicator={true}
              height="parent"
              defaultView="resourceTimeGridDay"
              events={(_, successCallback): void => {
                if (state.currentView.indexOf("resource") !== 0) {
                  const selectedLocations = makeSelectedLocationDict(
                    state.locations
                  );
                  successCallback(
                    state.events.filter(
                      (event) => selectedLocations[event.resourceId]
                    )
                  );
                } else {
                  successCallback(state.events);
                }
              }}
              resources={state.locations.filter(
                (location) => location.selected
              )}
              schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
            />
          )}
        </Box>
      )}
    </div>
  );
};

export default Calendar;
