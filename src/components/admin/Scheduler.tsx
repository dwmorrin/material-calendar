import React, { FunctionComponent, memo, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import Semester from "../../resources/Semester";
import VirtualWeek from "../../resources/VirtualWeek";
import Project, { defaultProject } from "../../resources/Project";
import Location from "../../resources/Location";
import {
  compareCalendarStates,
  daysInInterval,
  eventClick,
  fetchDefaultLocation,
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
import { Fab, Snackbar } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

const Scheduler: FunctionComponent<AdminUIProps> = ({ dispatch, state }) => {
  const { schedulerLocationId: locationId, selectedSemester, ref } = state;
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const semesters = state.resources[ResourceKey.Semesters] as Semester[];
  const virtualWeeks = state.resources[
    ResourceKey.VirtualWeeks
  ] as VirtualWeek[];
  const [defaultLocationId, setDefaultLocationId] = useState(-1);
  const semester =
    selectedSemester ||
    (semesters.length ? semesters.reduce(mostRecent) : undefined);

  useEffect(() => {
    if (!semesters.length) {
      // user needs to create a semester; navigate them to that view
      dispatch({
        type: AdminAction.SelectedResource,
        payload: { resourceKey: ResourceKey.Semesters },
      });
    } else if (!selectedSemester && semester && ref?.current)
      // we've automatically "selected" a semester, so update state accordingly
      dispatch({
        type: AdminAction.SelectedSemester,
        payload: {
          selectedSemester: semester,
        },
      });
  }, [dispatch, selectedSemester, semesters, semester, ref]);

  useEffect(() => {
    if (!locationId) fetchDefaultLocation(dispatch, setDefaultLocationId);
  }, [dispatch, locationId]);

  const selectedLocationId = locationId || defaultLocationId;

  if (!semester?.start) {
    return (
      <div>Invalid semester (no start date). Fix the selected semester.</div>
    );
  }

  const location =
    locations.find((location) => location.id === selectedLocationId) ||
    new Location();
  const numberOfDays = daysInInterval(semester.start, semester.end);
  const dailyHours = makeDailyHours(location);
  const resources = makeResources(projects, selectedLocationId, semester);
  const allotments = makeAllotments(projects, selectedLocationId);
  const events = [
    ...processVirtualWeeks(virtualWeeks, selectedLocationId),
    ...allotments,
    ...dailyHours,
    ...processVirtualWeeksAsHoursRemaining(virtualWeeks, selectedLocationId),
  ];

  return (
    <>
      <Snackbar
        open={!dailyHours.length}
        message="Start by creating the daily hours for this location."
        anchorOrigin={{ horizontal: "left", vertical: "top" }}
      />
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
          el.onclick = resourceClickHandler({
            id,
            title,
            dispatch,
            location,
            semester,
          });
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
        timeZone={process.env.REACT_APP_TZ}
        nowIndicator={true}
        height="auto"
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        ref={ref}
        schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
      />
      <Fab
        variant="extended"
        onClick={(): void =>
          //! consider adding action "jump to document"
          dispatch({
            type: AdminAction.SelectedDocument,
            payload: {
              resourceKey: ResourceKey.Projects,
              resourceInstance: new Project({
                ...defaultProject,
                locationHours: [{ locationId: location.id, hours: 0 }],
              }),
            },
          })
        }
      >
        <AddIcon /> Add project
      </Fab>
    </>
  );
};

export default memo(Scheduler, compareCalendarStates);
