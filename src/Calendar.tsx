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
  Button
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import TodayIcon from "@material-ui/icons/Today";
import { RouteComponentProps } from "@reach/router";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import TemporaryDrawer from "./TemporaryDrawer";
import ViewMenu from "./ViewMenu";
import Database from "./Database.js";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
    color: "white"
  }
}));

const fakeEventDate = (offset: number): Date => {
  const date = new Date();
  date.setHours(date.getHours() + offset);
  return date;
};
const getCurrentTimeString = (): string => {
  const date = new Date();
  const timeString = date.toTimeString().split(" ")[0];
  return timeString;
};

const Calendar: FunctionComponent<RouteComponentProps> = () => {
  const [currentStart, setCurrentStart] = useState(new Date());
  const [pickerShowing, setPickerShowing] = useState(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const classes = useStyles();
  const calendarRef = useRef<FullCalendar>(null);
  const tempLocations = Database.locations;

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
    setDrawerIsOpen(!drawerIsOpen);
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
    calendarApi.scrollToTime(getCurrentTimeString());
  }, []);

  const handleClickMonth = (): void => {
    setPickerShowing(!pickerShowing);
  };
  const handleClickToday = (): void => {
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
      <div onClick={(): void => setDrawerIsOpen(!drawerIsOpen)}>
        <TemporaryDrawer
          open={drawerIsOpen}
          onOpen={toggleDrawer}
          onClose={toggleDrawer}
          panelType={"checkboxes"}
          drawerContents={tempLocations}
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
            {/* <IconButton color="inherit" onClick={handleClickToday}>
              <TodayIcon />
            </IconButton> */}
            <ViewMenu />
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
            events={[
              {
                resourceId: "a",
                id: "a",
                title: "My Event",
                start: fakeEventDate(0),
                end: fakeEventDate(3)
              }
            ]}
            resources={[
              {
                id: "a",
                title: "Room A"
              },
              {
                id: "b",
                title: "Room B"
              }
            ]}
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
          />
        </Box>
      )}
    </div>
  );
};

export default Calendar;
