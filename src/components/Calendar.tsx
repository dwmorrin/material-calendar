import React, { FunctionComponent, useEffect, useState, useRef } from "react";
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
import TemporaryDrawer from "../TemporaryDrawer";
import Event from "../calendar/Event";
import Location from "../calendar/Location";

interface HttpResponse<T> extends Response {
  parsedBody?: T;
}
async function http<T>(request: RequestInfo): Promise<HttpResponse<T>> {
  const response: HttpResponse<T> = await fetch(request);
  try {
    response.parsedBody = await response.json();
  } catch (exception) {}
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response;
}

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

const getCurrentTimeString = () => {
  const date = new Date();
  const timeString = date.toTimeString().split(" ")[0];
  return timeString;
};

const Calendar: FunctionComponent<RouteComponentProps> = () => {
  const [currentStart, setCurrentStart] = useState(new Date());
  const [pickerShowing, setPickerShowing] = useState(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const classes = useStyles();
  const calendarRef = useRef<FullCalendar>(null);

  const toggleDrawer = () => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setDrawerIsOpen(!drawerIsOpen);
  };

  async function fetchData() {
    let response: HttpResponse<Event[]>;
    try {
      response = await http<Event[]>("/events");
      if (!response.parsedBody) {
        return;
      }
      const events = response.parsedBody.map(
        (event) =>
          new Event(
            event.id,
            event.start,
            event.end,
            event.location,
            event.title
          )
      );
      setEvents(events);
    } catch (response) {
      console.error(response);
    }
  }
  async function fetchLocations() {
    let response: HttpResponse<Location[]>;
    try {
      response = await http<Location[]>("/locations");
      if (!response.parsedBody) {
        return;
      }
      const locations = response.parsedBody.map((location) => {
        const loc = new Location(location.name, location.name);
        if (location.eventColor) {
          loc.eventColor = "blue";
        }
        return loc;
      });
      setLocations(locations);
    } catch (response) {
      console.error(response);
    }
  }

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
    calendarApi.scrollToTime(getCurrentTimeString());
    fetchData();
    fetchLocations();
  }, []);

  const handleClickMonth = () => {
    setPickerShowing(!pickerShowing);
  };
  const handleClickToday = () => {
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
    calendarApi.scrollToTime(getCurrentTimeString());
    setCurrentStart(calendarApi.view.currentStart);
  };
  return (
    <div className={classes.root}>
      <div onClick={() => setDrawerIsOpen(!drawerIsOpen)}>
        <TemporaryDrawer
          open={drawerIsOpen}
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
                {currentStart.toLocaleString("default", { month: "long" })}
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
      {pickerShowing && (
        <Box>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <DatePicker value={currentStart} onChange={handleClickMonth} />
          </MuiPickersUtilsProvider>
        </Box>
      )}
      {!pickerShowing && (
        <Box>
          <FullCalendar
            ref={calendarRef}
            header={false}
            allDaySlot={false}
            nowIndicator={true}
            height="auto"
            defaultView="resourceTimeGridDay"
            plugins={[resourceTimeGridPlugin]}
            events={events}
            resources={locations}
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
          />
        </Box>
      )}
    </div>
  );
};

export default Calendar;
