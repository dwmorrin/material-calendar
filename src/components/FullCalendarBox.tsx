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

const FullCalendarBox: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const selectedProjects = state.projects.filter((project) => project.selected);
  const projectLocations = new Set();
  selectedProjects.forEach((project) =>
    project.locationIds.forEach((id) => projectLocations.add(id))
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
            const event = state.events.find(
              (event) => event.id === +info.event.id
            );
            dispatch({
              type: CalendarAction.ViewEventDetail,
              payload: { currentEvent: event },
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
            if (state.currentView.indexOf("resource") !== 0) {
              const selectedLocations = makeSelectedLocationDict(
                state.locations
              );
              successCallback(
                state.events.filter(
                  (event) =>
                    projectLocations.has(event.resourceId) ||
                    selectedLocations[event.resourceId]
                )
              );
            } else {
              successCallback(state.events);
            }
          }}
          resources={state.locations.filter(
            (location) => projectLocations.has(location.id) || location.selected
          )}
          schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        />
      )}
    </Box>
  );
};

export default FullCalendarBox;
