import React, { FunctionComponent, memo, useEffect, useState } from "react";
import { CircularProgress } from "@material-ui/core";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import Semester from "../../resources/Semester";
import VirtualWeek from "../../resources/VirtualWeek";
import Project from "../../resources/Project";
import Location from "../../resources/Location";
import {
  compareCalendarStates,
  daysInInterval,
  eventClick,
  fetchDefaultLocation,
  fetchVirtualWeeks,
  makeAllotments,
  makeDailyHours,
  makeResources,
  mostRecent,
  processVirtualWeeks,
  processVirtualWeeksAsHoursRemaining,
  resourceClickHandler,
  selectionHandler,
} from "../../admin/scheduler";
import { AdminUIProps, AdminAction } from "../../admin/types";
import { ResourceKey } from "../../resources/types";

const Scheduler: FunctionComponent<AdminUIProps> = ({ dispatch, state }) => {
  const { schedulerLocationId: locationId, selectedSemester, ref } = state;
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const semesters = state.resources[ResourceKey.Semesters] as Semester[];
  const [virtualWeeks, setVirtualWeeks] = useState([] as VirtualWeek[]);
  const [defaultLocationId, setDefaultLocationId] = useState(-1);

  const semester =
    selectedSemester || semesters.reduce(mostRecent, new Semester());

  useEffect(() => {
    fetchDefaultLocation(dispatch, setDefaultLocationId);
  }, [dispatch]);

  useEffect(() => {
    fetchVirtualWeeks(
      dispatch,
      setVirtualWeeks,
      locationId || defaultLocationId
    );
  }, [dispatch, defaultLocationId, locationId]);

  const selectedLocationId = locationId || defaultLocationId;

  const location =
    locations.find((location) => location.id === selectedLocationId) ||
    new Location();
  const numberOfDays = daysInInterval(semester.start, semester.end);
  const dailyHours = makeDailyHours(location);
  const resources = makeResources(projects, selectedLocationId);
  const allotments = makeAllotments(projects, selectedLocationId);
  const events = [
    ...processVirtualWeeks(virtualWeeks, selectedLocationId),
    ...allotments,
    ...dailyHours,
    ...processVirtualWeeksAsHoursRemaining(virtualWeeks, selectedLocationId),
  ];

  if (!semester.start) {
    return <CircularProgress />;
  }

  return (
    <FullCalendar
      // RESOURCES
      resources={resources}
      resourceAreaHeaderContent={`${location.title} \u00B7 ${semester.title}`}
      resourceAreaHeaderDidMount={({ el }): void => {
        el.style.cursor = "pointer";
        el.addEventListener("click", () =>
          dispatch({ type: AdminAction.OpenSemesterDialog })
        );
      }}
      resourceOrder="id" // TODO user preference; create an order prop
      resourcesInitiallyExpanded={false} // TODO user preference
      resourceLabelDidMount={({ resource: { id, title }, el }): void => {
        el.style.cursor = "default"; //! TODO move to CSS
        el.onclick = resourceClickHandler(id, title);
      }}
      // EVENTS
      events={events}
      eventClick={eventClick(dispatch, location)}
      // SELECTIONS
      selectable={true}
      select={selectionHandler(dispatch, location)}
      // VISIBLE DATE RANGE
      initialDate={semester.start}
      initialView="resourceTimelineSemester"
      slotDuration={{ days: 1 }}
      views={{
        resourceTimelineSemester: {
          type: "resourceTimeline",
          dayCount: numberOfDays,
        },
      }}
      // HEADER CONFIG
      headerToolbar={false}
      slotMinWidth={25}
      slotLabelFormat={[
        { month: "long" },
        { weekday: "narrow" },
        { day: "numeric" },
      ]}
      // ETC
      timeZone="UTC"
      nowIndicator={true}
      height="auto"
      plugins={[resourceTimelinePlugin, interactionPlugin]}
      ref={ref}
      schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
    />
  );
};

export default memo(Scheduler, compareCalendarStates);
