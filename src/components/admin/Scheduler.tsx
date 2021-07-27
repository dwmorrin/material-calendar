import React, { FunctionComponent, memo, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import resourceTimelinePlugin from "@fullcalendar/resource-timeline";
import interactionPlugin from "@fullcalendar/interaction";
import VirtualWeek from "../../resources/VirtualWeek";
import Project, { defaultProject } from "../../resources/Project";
import Location from "../../resources/Location";
import {
  compareCalendarStates,
  daysInInterval,
  eventClick,
  makeAllotments,
  makeDailyHours,
  makeResources,
  processVirtualWeeks,
  processVirtualWeeksAsHoursRemaining,
  resourceClick,
  selectionHandler,
} from "../../admin/scheduler";
import {
  AdminSelectionProps,
  AdminUIProps,
  AdminAction,
} from "../../admin/types";
import { ResourceKey } from "../../resources/types";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";

const Scheduler: FunctionComponent<AdminUIProps & AdminSelectionProps> = ({
  dispatch,
  state,
  selections,
  setSelections,
}) => {
  const { ref } = state;
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const virtualWeeks = state.resources[
    ResourceKey.VirtualWeeks
  ] as VirtualWeek[];

  useEffect(() => {
    if (state.ref?.current && state.selectedSemester) {
      state.ref.current.getApi().gotoDate(state.selectedSemester.start);
    }
  }, [state.ref, state.selectedSemester]);

  const semester = state.selectedSemester;
  if (!semester) {
    return <div>Create a semester first.</div>;
  }
  if (!locations.length) {
    return <div>Create some locations first.</div>;
  }
  const location =
    selections.locationId > 0
      ? locations.find((location) => location.id === selections.locationId)
      : locations.length
      ? locations[0]
      : null;
  if (!location) {
    return <div>Please select a location.</div>;
  } else if (selections.locationId !== location.id) {
    setSelections({ semesterId: semester.id, locationId: location.id });
  }

  const numberOfDays = daysInInterval(semester.start, semester.end);
  const dailyHours = makeDailyHours(location, numberOfDays, semester);
  const resources = makeResources(projects, selections.locationId, semester);
  const allotments = makeAllotments(projects, selections.locationId);
  const events = [
    ...processVirtualWeeks(virtualWeeks, selections.locationId),
    ...allotments,
    ...dailyHours,
    ...processVirtualWeeksAsHoursRemaining(virtualWeeks, selections.locationId),
  ];

  return (
    <>
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
        resourcesInitiallyExpanded={true} // TODO user preference
        resourceLabelDidMount={({ resource: { id }, el }): void => {
          el.style.cursor = "default"; //! TODO move to CSS
          el.onclick = resourceClick({
            id,
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
        select={selectionHandler(dispatch, state, location, semester)}
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
        timeZone={process.env.REACT_APP_SERVER_TIMEZONE}
        nowIndicator={true}
        height="auto"
        plugins={[resourceTimelinePlugin, interactionPlugin]}
        ref={ref}
        schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
      />
      <Fab
        variant="extended"
        onClick={(): void =>
          dispatch({
            type: AdminAction.OpenAddProjectToLocation,
            // not needed right now, but hold onto this idea
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
