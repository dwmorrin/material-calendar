import React, { FunctionComponent, memo, useContext } from "react";
import {
  CircularProgress,
  makeStyles,
  Box,
  Grid,
  Typography,
} from "@material-ui/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  CalendarUIProps,
  CalendarAction,
  CalendarUISelectionProps,
  CalendarView,
} from "../calendar/types";
import { ResourceKey } from "../resources/types";
import Event from "../resources/Event";
import Location from "../resources/Location";
import Project from "../resources/Project";
import {
  addResourceId,
  compareCalendarStates,
  makeResources,
  makeSelectedLocationIdSet,
  getEventsByLocationId,
} from "../calendar/calendar";
import { AuthContext } from "./AuthContext";
import User from "../resources/User";
import { parseAndFormatFCString } from "../utils/date";

const useStyles = makeStyles((theme) => ({
  toolbarSpacer: { ...theme.mixins.toolbar, position: "sticky" },
  fullHeight: { minHeight: "100vh" },
}));

const SelectALocationMessage: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
      className={classes.fullHeight}
    >
      <Typography variant="h3">Select a location to view a calendar</Typography>
    </Grid>
  );
};

const FullCalendarBox: FunctionComponent<
  CalendarUIProps & CalendarUISelectionProps
> = ({ dispatch, state, selections }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = process.env.NODE_ENV === "development" || User.isAdmin(user);
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const projectLocations = makeSelectedLocationIdSet(
    projects,
    selections.projectIds
  );
  const events = state.resources[ResourceKey.Events] as Event[];
  const byLocationId = getEventsByLocationId(
    events,
    projectLocations,
    selections.locationIds
  );
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const classes = useStyles();

  if (state.initialResourcesPending)
    return <CircularProgress size="90%" thickness={1} />;
  if (!selections.locationIds.some((id) => locations.find((l) => l.id === id)))
    return <SelectALocationMessage />;
  return (
    <Box>
      <Box className={classes.toolbarSpacer} />
      <FullCalendar
        // RESOURCES
        resourceOrder="title"
        resources={makeResources(
          locations,
          projectLocations,
          selections.locationIds
        )}
        // EVENTS
        events={(_, successCallback): void => {
          // https://fullcalendar.io/docs/events-function
          if (
            (
              ["resourceTimeGridDay", "resourceTimeGridWeek"] as CalendarView[]
            ).includes(selections.calendarView)
          ) {
            // FullCalendar's resource system handles locations automatically
            // so long as we provide a .resourceId prop
            successCallback(events.map(addResourceId));
          } else {
            // We are not using the resource system; we have to manually group locations
            successCallback(byLocationId);
          }
        }}
        eventClick={(info): void =>
          dispatch({
            type: CalendarAction.OpenEventDetail,
            payload: {
              currentEvent: events.find((event) => event.id === +info.event.id),
            },
          })
        }
        // VISIBLE DATE RANGE
        initialDate={state.currentStart}
        initialView={selections.calendarView}
        // HEADER CONFIG
        headerToolbar={false}
        // INTERACTIONS
        selectable={isAdmin}
        select={({
          resource = { id: -1, title: "" },
          startStr,
          endStr,
        }): void =>
          dispatch({
            type: CalendarAction.OpenEventEditor,
            payload: {
              currentEvent: new Event({
                id: -1,
                start: parseAndFormatFCString(startStr),
                end: parseAndFormatFCString(endStr),
                location: { id: +resource.id, title: resource.title },
                title: "",
                reservable: false,
              }),
            },
          })
        }
        // ETC
        firstDay={Number(process.env.REACT_APP_FIRST_DAY)}
        timeZone={process.env.REACT_APP_SERVER_TIMEZONE}
        height="93vh"
        ref={state.ref}
        allDaySlot={false}
        nowIndicator={true}
        plugins={[
          dayGridPlugin,
          interactionPlugin,
          listPlugin,
          resourceTimeGridPlugin,
        ]}
        schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
      />
    </Box>
  );
};

export default memo(FullCalendarBox, compareCalendarStates);
