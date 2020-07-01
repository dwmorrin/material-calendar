import React, { FunctionComponent, memo } from "react";
import { CircularProgress } from "@material-ui/core";
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
  makeReduceEventsByLocationId,
  stringStartsWithResource,
} from "../calendar/calendar";

const FullCalendarBox: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const projectLocations = makeSelectedLocationIdSet(projects);
  const events = state.resources[ResourceKey.Events] as Event[];
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const byLocationId = makeReduceEventsByLocationId(
    projectLocations,
    makeSelectedLocationDict(locations)
  );

  if (state.loading) return <CircularProgress size="100%" thickness={1} />;
  return (
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
          successCallback(events.reduce(byLocationId, [] as {}[]));
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
      // ETC
      timeZone="UTC"
      height="auto"
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
  );
};

export default memo(FullCalendarBox, compareCalendarStates);
