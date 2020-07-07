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
import { AdminAction } from "../../admin/types";

interface SchedulerProps {
  dispatch: (action: { type: AdminAction }) => void;
  locationId?: number;
  locations: Location[];
  projects: Project[];
}

const Scheduler: FunctionComponent<SchedulerProps> = ({
  dispatch,
  locationId,
  locations,
  projects,
}) => {
  const [virtualWeeks, setVirtualWeeks] = useState([] as VirtualWeek[]);
  const [semester, setSemester] = useState(new Semester());
  const [defaultLocationId, setDefaultLocationId] = useState(-1);
  useEffect(() => {
    fetchDefaultLocation(dispatch, setDefaultLocationId);
    fetchCurrentSemester(dispatch, setSemester);
  }, [dispatch]);

  useEffect(() => {
    fetchVirtualWeeks(
      locationId || defaultLocationId,
      dispatch,
      setVirtualWeeks
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

  return semester.start ? (
    <FullCalendar
      // RESOURCES
      resources={resources}
      resourceAreaHeaderContent={location.title}
      resourceOrder="id" // TODO user preference; create an order prop
      resourcesInitiallyExpanded={false} // TODO user preference
      resourceLabelDidMount={({ resource: { id, title }, el }): void => {
        el.style.cursor = "default"; //! TODO move to CSS
        el.onclick = resourceClickHandler(id, title);
      }}
      // EVENTS
      events={events}
      eventClick={({ event: { id, title } }): void => {
        window.alert(`ID: ${id}, TITLE: ${title}`);
      }}
      // INTERACTIONS
      selectable={true}
      select={({ start, end, resource = { id: -1, title: "" } }): void =>
        console.log({ start, end, resource })
      }
      // VISIBLE DATE RANGE
      initialDate={semester.start}
      initialView="resourceTimelineSemester"
      views={{
        resourceTimelineSemester: {
          type: "resourceTimeline",
          dayCount: numberOfDays + 1,
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
      schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
    />
  ) : (
    <CircularProgress />
  );
};

export default memo(Scheduler);
