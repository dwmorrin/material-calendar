import React, { FunctionComponent, useEffect, useState } from "react";
import { Box, CircularProgress } from "@material-ui/core";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import "@fullcalendar/core/main.css";
import "@fullcalendar/timeline/main.css";
import "@fullcalendar/resource-timeline/main.css";
import { ResourceKey } from "../../resources/types";
import { AdminUIProps } from "../../admin/types";
import Semester from "../../resources/Semester";
import VirtualWeek from "../../resources/VirtualWeek";
import Project from "../../resources/Project";
import Location from "../../resources/Location";
import {
  daysInInterval,
  fetchVirtualWeeks,
  makeAllotments,
  makeDailyHours,
  makeResources,
  processVirtualWeeks,
  processVirtualWeeksAsHoursRemaining,
  resourceClickHandler,
  fetchDefaultLocation,
  fetchCurrentSemester,
} from "../../admin/scheduler";

const Scheduler: FunctionComponent<AdminUIProps> = ({ dispatch, state }) => {
  const [virtualWeeks, setVirtualWeeks] = useState([] as VirtualWeek[]);
  const [semester, setSemester] = useState(new Semester());
  const [defaultLocationId, setDefaultLocationId] = useState(-1);
  useEffect(() => {
    fetchDefaultLocation(dispatch, setDefaultLocationId);
    fetchCurrentSemester(dispatch, setSemester);
  }, [dispatch]);

  useEffect(() => {
    fetchVirtualWeeks(
      state.schedulerLocationId || defaultLocationId,
      dispatch,
      setVirtualWeeks
    );
  }, [dispatch, defaultLocationId, state.schedulerLocationId]);

  const selectedLocationId = state.schedulerLocationId || defaultLocationId;

  const locations = state.resources[ResourceKey.Locations] as Location[];
  const location =
    locations.find((location) => location.id === selectedLocationId) ||
    new Location();
  const numberOfDays = daysInInterval(semester.start, semester.end);
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const dailyHours = makeDailyHours(location);
  const resources = makeResources(projects, selectedLocationId);
  const allotments = makeAllotments(projects, selectedLocationId);
  const events = [
    ...processVirtualWeeks(virtualWeeks, selectedLocationId),
    ...allotments,
    ...dailyHours,
    ...processVirtualWeeksAsHoursRemaining(virtualWeeks, selectedLocationId),
  ];

  return (
    <Box
      style={{ marginLeft: 20 }} // necessary to avoid swipeable drawer area
      display="flex"
      justifyContent="center"
      alignItems="center"
      flex="1"
      height="93vh" // important for FullCalendar sticky header & scrolling
    >
      {semester.start ? (
        <FullCalendar
          // RESOURCES
          resources={resources}
          resourceLabelText={location.title}
          resourceOrder="id" // TODO user preference; create an order prop
          resourceAreaWidth="10%" // TODO can this be draggable?
          resourcesInitiallyExpanded={false} // TODO user preference
          resourceRender={({ resource: { id, title }, el }): void => {
            el.style.cursor = "default"; //! TODO move to CSS
            el.onclick = resourceClickHandler(id, title);
          }}
          // EVENTS
          events={events}
          eventClick={({ event: { id, title } }): void => {
            window.alert(`ID: ${id}, TITLE: ${title}`);
          }}
          // VISIBLE DATE RANGE
          defaultDate={semester.start}
          defaultView="resourceTimelineSemester"
          views={{
            resourceTimelineSemester: {
              type: "resourceTimeline",
              dayCount: numberOfDays + 1,
            },
          }}
          // HEADER CONFIG
          header={false}
          slotWidth={25}
          slotLabelFormat={[
            { month: "long" },
            { weekday: "narrow" },
            { day: "numeric" },
          ]}
          // ETC
          timeZone="UTC"
          nowIndicator={true}
          height="parent"
          plugins={[resourceTimelinePlugin, interactionPlugin]}
          schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
        />
      ) : (
        <CircularProgress />
      )}
    </Box>
  );
};

export default Scheduler;
