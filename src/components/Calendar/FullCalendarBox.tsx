import React, { FunctionComponent, memo } from "react";
import { CircularProgress, makeStyles, Box } from "@material-ui/core";
import FullCalendar, { EventInput } from "@fullcalendar/react";
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
  addDays,
  formatSQLDate,
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

type FCEventRequest = { startStr: string; endStr: string };
type FCEventCallback = (events: EventInput[]) => void;

// https://fullcalendar.io/docs/events-function
// startStr and endStr format: "2022-05-13T00:00:00"
const getEvents = (
  { dispatch, state, selections }: CalendarUIProps & CalendarUISelectionProps,
  { startStr, endStr }: FCEventRequest,
  cb: FCEventCallback
): void => {
  if (state.initialResourcesPending) {
    // we're not ready yet!
    cb([]);
    return;
  }
  const dispatchError = (error: Error): void =>
    dispatch({ type: CalendarAction.Error, payload: { error } });
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const projectLocations = makeSelectedLocationIdSet(
    projects,
    selections.projectIds
  );
  const events = state.resources[ResourceKey.Events] as Event[];
  const groupIds: number[] = (
    state.resources[ResourceKey.Groups] as UserGroup[]
  ).map(({ id }) => id);
  // Check if app has already downloaded this event range
  // if the app isn't yet tracking the range it has downloaded,
  // add this to the global app state.
  const reqStart = parseFCString(startStr);
  const reqEnd = parseFCString(endStr);
  const expandingLeft = reqStart.valueOf() < state.eventRange.start.valueOf();
  const expandingRight = reqEnd.valueOf() > state.eventRange.end.valueOf();

  const inView = isWithinIntervalFP({
    start: reqStart,
    end: reqEnd,
  });

  const updateFullCalendar = (events: Event[]): void => {
    const eventsInView = events.filter((event) =>
      inView(
        parseSQLDatetime(event.start) || inView(parseSQLDatetime(event.end))
      )
    );
    if (
      (
        ["resourceTimeGridDay", "resourceTimeGridWeek"] as CalendarView[]
      ).includes(selections.calendarView)
    ) {
      // FullCalendar's resource system handles locations automatically
      // so long as we provide a .resourceId prop
      cb(eventsInView.map(addResourceId(groupIds)));
    } else {
      // We are not using the resource system; we have to manually group locations
      cb(
        getEventsByLocationId(
          groupIds,
          eventsInView,
          projectLocations,
          selections.locationIds
        )
      );
    }
  };

  if (!expandingLeft && !expandingRight) {
    // If the requested range is already downloaded, proceed as before.
    updateFullCalendar(events);
  } else {
    // figure out which way we are expanding
    const left = expandingLeft ? reqStart : state.eventRange.end;
    const newLeft = expandingLeft ? reqStart : state.eventRange.start;
    const right = expandingRight ? reqEnd : state.eventRange.start;
    const newRight = expandingRight ? reqEnd : state.eventRange.end;
    fetch(
      `${Event.url}/range?start=${formatSQLDate(left)}&end=${formatSQLDate(
        addDays(right, 1)
      )}`
    )
      .then((res) => {
        if (res.ok) return res.json();
        dispatchError(new Error("Could not fetch events, try again."));
      })
      .then(({ data, error }) => {
        if (error) return dispatchError(error);
        if (!Array.isArray(data))
          return dispatchError(new Error("data is not an array"));
        const expandedEvents = [...events, ...data.map((e) => new Event(e))];
        dispatch({
          type: CalendarAction.ReceivedResource,
          payload: {
            eventRange: { start: newLeft, end: newRight },
            resources: {
              [ResourceKey.Events]: expandedEvents,
            },
          },
          meta: ResourceKey.Events,
        });
      })
      .catch(dispatchError);
  }
};

const FullCalendarBox: FunctionComponent<
  CalendarUIProps & CalendarUISelectionProps
> = (props) => {
  const { dispatch, state, selections } = props;
  const { isAdmin } = useAuth();
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const projectLocations = makeSelectedLocationIdSet(
    projects,
    selections.projectIds
  );
  const events = state.resources[ResourceKey.Events] as Event[];
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const classes = useStyles();

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
        events={(req, cb): void => getEvents(props, req, cb)}
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
