import React, { FunctionComponent } from "react";
import { Box, CircularProgress } from "@material-ui/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import resourceTimeGridPlugin from "@fullcalendar/resource-timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "@fullcalendar/core/main.css";
import "@fullcalendar/daygrid/main.css";
import "@fullcalendar/list/main.css";
import "@fullcalendar/timegrid/main.css";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { makeSelectedLocationDict } from "../resources/Location";
import { ResourceKey } from "../resources/types";
import Event from "../resources/Event";
import Location from "../resources/Location";
import Project from "../resources/Project";

const stringStartsWithResource = (s: string): boolean =>
  s.indexOf("resource") === 0;

const FullCalendarBox: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const selectedProjects = state.resources[ResourceKey.Projects].filter(
    (project) => project.selected
  );
  const projectLocations = new Set();
  selectedProjects.forEach((project) =>
    (project as Project).allotments.forEach(({ locationId }) =>
      projectLocations.add(locationId)
    )
  );

  return (
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
          ref={state.ref}
          defaultDate={state.currentStart}
          header={false}
          allDaySlot={false}
          nowIndicator={true}
          height="parent"
          defaultView="resourceTimeGridDay"
          eventClick={(info): void => {
            const event = state.resources[ResourceKey.Events].find(
              (event) => event.id === +info.event.id
            );
            dispatch({
              type: CalendarAction.OpenEventDetail,
              payload: { currentEvent: event as Event },
            });
          }}
          plugins={[
            dayGridPlugin,
            interactionPlugin,
            listPlugin,
            resourceTimeGridPlugin,
          ]}
          events={(_, successCallback): void => {
            // https://fullcalendar.io/docs/events-function
            if (stringStartsWithResource(state.currentView)) {
              // FullCalendar's resource system handles locations automatically
              // so long as we provide a .resourceId prop
              successCallback(
                state.resources[ResourceKey.Events].map((event) => ({
                  ...event,
                  resourceId: (event as Event).location.id,
                }))
              );
            } else {
              // We are not using the resource system; we have to manually group locations
              const selectedLocations = makeSelectedLocationDict(
                state.resources[ResourceKey.Locations] as Location[]
              );
              successCallback(
                state.resources[ResourceKey.Events].filter(
                  (event) =>
                    projectLocations.has((event as Event).location.id) ||
                    selectedLocations[(event as Event).location.title as string]
                )
              );
            }
          }}
          resources={state.resources[ResourceKey.Locations]
            .filter(
              (location) =>
                projectLocations.has(location.id) || location.selected
            )
            .map((location) => ({ ...location, id: "" + location.id }))}
          schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        />
      )}
    </Box>
  );
};

export default FullCalendarBox;
