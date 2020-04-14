import React, { FunctionComponent, useEffect, useReducer, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import FullCalendar from "@fullcalendar/react";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import "@fullcalendar/core/main.css";
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

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const initialState: CalendarState = {
  currentStart: new Date(),
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
    dispatch({
      type: CalendarAction.Loading,
    });
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

  return (
    <div className={classes.root}>
      <TemporaryDrawer
        onClick={(): void => dispatch({ type: CalendarAction.ToggleDrawer })}
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
        >
          {state.loading && <CircularProgress />}
          {!state.loading && (
            <FullCalendar
              ref={calendarRef}
              defaultDate={state.currentStart}
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
          )}
        </Box>
      )}
    </div>
  );
};

export default Calendar;
