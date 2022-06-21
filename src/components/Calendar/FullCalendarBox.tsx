import React, { FunctionComponent, memo } from "react";
import { CircularProgress, makeStyles, Box } from "@material-ui/core";
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
} from "../types";
import { ResourceKey } from "../../resources/types";
import Event from "../../resources/Event";
import Location from "../../resources/Location";
import Project from "../../resources/Project";
import UserGroup from "../../resources/UserGroup";
import {
  addResourceId,
  compareCalendarStates,
  makeEventClick,
  makeResources,
  makeSelectedLocationIdSet,
  getEventsByLocationId,
} from "./lib";
import { useAuth } from "../AuthProvider";
import {
  isWithinIntervalFP,
  parseAndFormatFCString,
  parseFCString,
  parseSQLDatetime,
} from "../../utils/date";

const useStyles = makeStyles((theme) => ({
  toolbarSpacer: { ...theme.mixins.toolbar, position: "sticky" },
  fullHeight: { minHeight: "100vh" },
  noOverflow: { overflow: "hidden" },
}));

const FullCalendarBox: FunctionComponent<
  CalendarUIProps & CalendarUISelectionProps
> = ({ dispatch, state, selections }) => {
  const { isAdmin } = useAuth();
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const projectLocations = makeSelectedLocationIdSet(
    projects,
    selections.projectIds
  );
  const events = state.resources[ResourceKey.Events] as Event[];
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const groupIds: number[] = (
    state.resources[ResourceKey.Groups] as UserGroup[]
  ).map(({ id }) => id);
  const classes = useStyles();

  // const dispatchError = (error: Error): void =>
  //   dispatch({ type: CalendarAction.Error, payload: { error } });

  if (state.initialResourcesPending)
    return <CircularProgress size="90%" thickness={1} />;
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
        resourceLabelClassNames={classes.noOverflow}
        // EVENTS
        events={({ startStr, endStr }, successCallback): void => {
          // https://fullcalendar.io/docs/events-function
          // startStr and endStr format: "2022-05-13T00:00:00"
          const inView = isWithinIntervalFP({
            start: parseFCString(startStr),
            end: parseFCString(endStr),
          });
          const eventsInView = events.filter((event) =>
            inView(
              parseSQLDatetime(event.start) ||
                inView(parseSQLDatetime(event.end))
            )
          );
          // query paramters start and end take SQL date strings
          // const q = Object.entries({
          //   start: startStr.split("T")[0],
          //   end: endStr.split("T")[0],
          // })
          //   .map(([k, v]) => `${k}=${v}`)
          //   .join("&");

          // fetch(`${Event.url}/range?${q}`)
          //   .then((res) => {
          //     if (res.ok) return res.json();
          //     throw new Error(res.statusText);
          //   })
          //   .then(({ data, error }) => {
          //     if (error) return dispatchError(error);
          //     const eventsInView: Event[] = (data as Event[]).map(
          //       (e) => new Event(e)
          //     );
          if (
            (
              ["resourceTimeGridDay", "resourceTimeGridWeek"] as CalendarView[]
            ).includes(selections.calendarView)
          ) {
            // FullCalendar's resource system handles locations automatically
            // so long as we provide a .resourceId prop
            successCallback(eventsInView.map(addResourceId(groupIds)));
          } else {
            // We are not using the resource system; we have to manually group locations
            successCallback(
              getEventsByLocationId(
                groupIds,
                eventsInView,
                projectLocations,
                selections.locationIds
              )
            );
          }
          // })
          // .catch(dispatchError);
        }}
        eventClick={makeEventClick(dispatch, events)}
        // VISIBLE DATE RANGE
        initialView={selections.calendarView}
        // HEADER CONFIG
        headerToolbar={false}
        // INTERACTIONS
        selectable={process.env.NODE_ENV === "development" || isAdmin}
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
                location: {
                  id: +resource.id,
                  title: resource.title,
                  restriction: 0,
                  allowsWalkIns: false,
                },
                title: "",
                reservable: false,
                locked: false,
              }),
            },
          })
        }
        // ETC
        dayHeaderClassNames={classes.noOverflow}
        eventClassNames={classes.noOverflow}
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
