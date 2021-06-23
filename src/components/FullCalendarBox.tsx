import React, { FunctionComponent, memo, useContext } from "react";
import { CircularProgress, makeStyles, Box } from "@material-ui/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { ResourceKey } from "../resources/types";
import Event from "../resources/Event";
import Location, { makeSelectedLocationDict } from "../resources/Location";
import Project from "../resources/Project";
import {
  addResourceId,
  compareCalendarStates,
  makeResources,
  makeSelectedLocationIdSet,
  getEventsByLocationId,
  stringStartsWithResource,
} from "../calendar/calendar";
import { AuthContext } from "./AuthContext";
import User from "../resources/User";
import { parseAndFormatFCString } from "../utils/date";

const useStyles = makeStyles((theme) => ({
  toolbarSpacer: { ...theme.mixins.toolbar, position: "sticky" },
}));

const FullCalendarBox: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useContext(AuthContext);
  const isAdmin = process.env.NODE_ENV === "development" || User.isAdmin(user);
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const projectLocations = makeSelectedLocationIdSet(projects);
  const events = state.resources[ResourceKey.Events] as Event[];
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const byLocationId = getEventsByLocationId(
    events,
    projectLocations,
    makeSelectedLocationDict(locations)
  );
  const classes = useStyles();

  if (state.loading) return <CircularProgress size="90%" thickness={1} />;
  return (
    <Box>
      <Box className={classes.toolbarSpacer} />
      <FullCalendar
        // RESOURCES
        resources={makeResources(
          state.resources[ResourceKey.Locations] as Location[],
          projectLocations
        )}
        // EVENTS
        events={(_, successCallback): void => {
          // https://fullcalendar.io/docs/events-function
          if (stringStartsWithResource(state.currentView)) {
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
        initialView={state.currentView}
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
