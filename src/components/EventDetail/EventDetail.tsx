import React, { FunctionComponent, useEffect, useState } from "react";
import {
  Button,
  ButtonGroup,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Paper,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../types";
import CloseIcon from "@material-ui/icons/Close";
import {
  castSQLDateToSQLDatetime,
  isBefore,
  isSameDay,
  isValidSQLDatetimeInterval,
  isWithinInterval,
  nowInServerTimezone,
  parseAndFormatSQLDatetimeInterval,
  parseSQLDate,
  parseSQLDatetime,
  sqlIntervalInHours,
  subHours,
  subMinutes,
} from "../../utils/date";
import { useAuth } from "../AuthProvider";
import { makeTransition } from "../Transition";
import { ResourceKey } from "../../resources/types";
import Project, { ProjectAllotment } from "../../resources/Project";
import Reservation from "../../resources/Reservation";
import UserGroup from "../../resources/UserGroup";
import ReservationForm from "../ReservationForm/ReservationForm";
import ReservationFormAdmin from "../ReservationForm/ReservationFormAdmin";
import ListSubheader from "@material-ui/core/ListSubheader";
import Event from "../../resources/Event";
import CancelationDialog from "../CancelationDialog";
import EventBookButton from "./EventBookButton";
import { addMinutes } from "date-fns/esm";
import { useSocket } from "../SocketProvider";

const transition = makeTransition("left");

type ProjectHours = {
  id: number;
  hours?: number;
};

const allotmentInLocationAtDate =
  (locationId: number, date: Date) =>
  (a: ProjectAllotment): boolean =>
    a.locationId === locationId &&
    isWithinInterval(date, {
      start: parseSQLDatetime(castSQLDateToSQLDatetime(a.start)),
      end: parseSQLDatetime(castSQLDateToSQLDatetime(a.end, "23:59:59")),
    });

const EventDetail: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { isAdmin, user } = useAuth();
  const { broadcast } = useSocket();
  const [cancelationDialogIsOpen, setCancelationDialogIsOpen] = useState(false);
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const [usedHours, setUsedHours] = useState<ProjectHours[]>(
    projects.map(({ id }) => ({ id }))
  );

  /**
   * Get total hours, per project, used by everyone in this space
   * and allotment period.
   *
   * This is a business logic requirement:
   *   Each project has a set of hours allotted to it,
   *   we'll check if we have exceeded that allotment.
   *
   * The server will also perform this check upon reservation creation,
   * this is just a convenience for the user to avoid opening the
   * reservation form when it will be rejected.
   */
  useEffect(() => {
    if (!state.currentEvent || !state.currentEvent.location) return;
    const locationId = state.currentEvent?.location.id;
    const start = parseSQLDate(state.currentEvent.start.split(" ")[0]);
    if (!locationId) return;
    const urls = projects
      .map(({ id, allotments }) => {
        const allotment = allotments.find(
          allotmentInLocationAtDate(locationId, start)
        );
        if (!allotment) return "";
        const query = [
          ["projectId", id],
          ["locationId", locationId],
          ["start", allotment.start],
          ["end", allotment.end],
        ]
          .map(([key, value]) => `${key}=${value}`)
          .join("&");
        return `${Project.url}/used-hours?${query}`;
      })
      .filter(String);
    Promise.all(urls.map((url) => fetch(url).then((r) => r.json()))).then(
      (hours) => setUsedHours(hours as ProjectHours[])
    );
  }, [projects, state.currentEvent]);

  // if the event is locked, try to unlock it
  useEffect(() => {
    if (!state.currentEvent || !state.currentEvent.locked) return;
    fetch(`${Event.url}/${state.currentEvent.id}/unlock`, { method: "POST" })
      .then((res) => res.json())
      .then(({ data }) => {
        // ignoring the 'error' key for now
        if (!data?.event) return;
        // event has been unlocked; update state
        dispatch({
          type: CalendarAction.FoundStaleCurrentEvent,
          payload: { currentEvent: new Event(data.event as Event) },
        });
      });
  }, [dispatch, state.currentEvent]);

  if (!state.currentEvent || !state.currentEvent.location || !user.username) {
    return null;
  }

  const events = state.resources[ResourceKey.Events] as Event[];
  const reservations = state.resources[
    ResourceKey.Reservations
  ] as Reservation[];

  const { end, location, locked, reservable, reservation, start, title } =
    state.currentEvent;

  const userCanUseLocation = user.restriction >= location.restriction;

  const startDate = parseSQLDatetime(start);
  const endDate = parseSQLDatetime(end);
  const reservationCreated = parseSQLDatetime(reservation?.created || "");

  const cancelationApprovalCutoff = subHours(
    startDate,
    Reservation.rules.refundCutoffHours
  );

  const gracePeriodCutoff = addMinutes(
    reservationCreated,
    Reservation.rules.refundGracePeriodMinutes
  );

  const currentUserWalkInProject = projects.find(
    (project) => project.title === Project.walkInTitle
  );

  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const currentUserWalkInProjectGroup = groups.find(
    (group) => group.projectId === currentUserWalkInProject?.id
  );

  // returns true if there is no walk-in project
  const hasReachedTheWalkInLimit = (event: Event): boolean => {
    if (!currentUserWalkInProjectGroup) return true;
    const now = nowInServerTimezone();
    const myReservations = reservations.filter(
      (reservation) =>
        !reservation.cancelation?.refund.approved.by &&
        reservation.groupId === currentUserWalkInProjectGroup.id &&
        events.find((e) => e.id === reservation.eventId)?.location.groupId ===
          event.location.groupId &&
        isSameDay(
          parseSQLDatetime(
            events.find((event) => event.id === reservation.eventId)?.start ||
              ""
          ),
          now
        )
    );
    return Reservation.rules.maxWalkInsPerLocation <= myReservations.length;
  };

  const getProjectGroup = (project: Project): UserGroup | undefined => {
    return (state.resources[ResourceKey.Groups] as UserGroup[]).find(
      (group) => group.projectId === project.id
    );
  };

  const projectGroupHasHoursRemaining = (
    project: Project,
    group: UserGroup
  ): boolean => {
    if (!group) return false;
    const thisEventHours = sqlIntervalInHours(start, end);
    const groupHasHours =
      project.groupAllottedHours >= group.reservedHours + thisEventHours;
    // TODO verify this is correct - try to make it fail
    // TODO redundant use of allotmentInLocationAtDate: can we do it once?
    const locationId = state.currentEvent?.location.id || 0;
    const date = parseSQLDatetime(state.currentEvent?.start || "");
    const allotment = project.allotments.find(
      allotmentInLocationAtDate(locationId, date)
    );
    if (!allotment) return false;
    const projectHoursUsed =
      usedHours.find((h) => h.id === project.id)?.hours || 0;
    const projectHasHoursHereAndNow =
      allotment.hours - projectHoursUsed >= thisEventHours;
    return groupHasHours && projectHasHoursHereAndNow;
  };

  const walkInValid =
    Event.isAvailableForWalkIn(state.currentEvent) &&
    !hasReachedTheWalkInLimit(state.currentEvent);

  const projectsActiveNow = projects.filter(
    ({ title, allotments }) =>
      (title === Project.walkInTitle && state.currentEvent && walkInValid) ||
      allotments.some(
        (a) =>
          a.locationId === location.id &&
          isValidSQLDatetimeInterval({
            start: castSQLDateToSQLDatetime(a.start),
            end: start,
          }) &&
          isValidSQLDatetimeInterval({
            start,
            end: castSQLDateToSQLDatetime(a.end, "23:59:59"),
          })
      )
  );

  const open = reservable && !reservation && userCanUseLocation;
  const userOwns = Boolean(
    reservation &&
      (state.resources[ResourceKey.Groups] as UserGroup[]).find(
        (group) => reservation.groupId === group.id
      )
  );

  const reservationCutoffHasNotPassed = isBefore(
    nowInServerTimezone(),
    subMinutes(endDate, Reservation.rules.inProgressCutoffMinutes)
  );

  const eventHasNotEnded = isBefore(
    nowInServerTimezone(),
    parseSQLDatetime(end)
  );

  const equipmentList = reservation?.equipment
    ? Object.entries(reservation.equipment)
    : [];

  const [projectsWithHours, projectsWithoutHours, projectsWithoutGroups] =
    projectsActiveNow.reduce(
      (projectsByHours, p) => {
        const group = getProjectGroup(p);
        if (!group) projectsByHours[2].push(p);
        else if (projectGroupHasHoursRemaining(p, group))
          projectsByHours[0].push(p);
        else projectsByHours[1].push(p);
        return projectsByHours;
      },
      [[], [], []] as [Project[], Project[], Project[]]
    );

  const makeOpenProjectDashboard = (project: Project) => (): void => {
    dispatch({
      type: CalendarAction.OpenProjectDashboard,
      payload: {
        ...state,
        currentProject: project,
      },
    });
  };

  return (
    <Dialog open={state.detailIsOpen} TransitionComponent={transition}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseEventDetail })
          }
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle>Event Detail</DialogTitle>
      </Toolbar>
      <DialogContent>
        <Paper elevation={0}>
          <Typography variant="h5">{title}</Typography>
          <Typography variant="h6">{location.title}</Typography>
          <Typography variant="body2">
            {parseAndFormatSQLDatetimeInterval({ start, end })}
          </Typography>
          {!!equipmentList.length && (
            <List
              subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  Requested Equipment
                </ListSubheader>
              }
            >
              {equipmentList.map(([name, item]) => (
                <ListItem key={name}>{name + ": " + item.quantity}</ListItem>
              ))}
            </List>
          )}
          {!userCanUseLocation && (
            // TODO: Make this an admin configurable message
            <Typography component="h5">
              This location is restricted. At this time, you are not permitted
              to reserve this location.
            </Typography>
          )}
          <ButtonGroup orientation="vertical">
            <EventBookButton
              reservationCutoffHasNotPassed={reservationCutoffHasNotPassed}
              userOwns={userOwns}
              open={open}
              projectsAvailable={walkInValid || !!projectsWithHours.length}
              dispatch={dispatch}
              event={state.currentEvent}
              walkInValid={walkInValid}
            />
            {userOwns && eventHasNotEnded && (
              <Button
                variant="contained"
                color="secondary"
                key="CancelReservation"
                onClick={(): void => setCancelationDialogIsOpen(true)}
              >
                Cancel Reservation
              </Button>
            )}
            {isAdmin && (
              <Button
                disabled={locked}
                variant="contained"
                onClick={(): void =>
                  dispatch({
                    type: CalendarAction.OpenEventEditor,
                    payload: state,
                  })
                }
              >
                Edit this event
              </Button>
            )}
            {isAdmin && (
              <Button
                disabled={locked}
                variant="contained"
                onClick={(): void =>
                  dispatch({ type: CalendarAction.OpenReservationFormAdmin })
                }
              >
                ADMIN RESERVATION FORM
              </Button>
            )}
          </ButtonGroup>
        </Paper>
        {eventHasNotEnded && open && !walkInValid && (
          <Paper elevation={0}>
            <Typography variant="h5">Project Info</Typography>
            <Typography variant="body2">
              {projectsWithHours.length
                ? "These projects are available:"
                : "Not available to any of your projects"}
            </Typography>
            <List>
              {projectsWithHours.map((project) => (
                <ListItem key={`${project.title}_list_item`}>
                  <Button onClick={makeOpenProjectDashboard(project)}>
                    {project.title}
                  </Button>
                </ListItem>
              ))}
            </List>
            {!!projectsWithoutHours.length && (
              <Typography variant="body2">
                These projects have no hours remaining:
              </Typography>
            )}
            <List>
              {projectsWithoutHours.map((project) => (
                <ListItem key={`${project.title}_list_item`}>
                  <Button onClick={makeOpenProjectDashboard(project)}>
                    {project.title}
                  </Button>
                </ListItem>
              ))}
            </List>
            {!!projectsWithoutGroups.length && (
              <Typography variant="body2">
                Please create a group for these projects:
              </Typography>
            )}
            <List>
              {projectsWithoutGroups.map((project) => (
                <ListItem key={`${project.title}_list_item`}>
                  <Button onClick={makeOpenProjectDashboard(project)}>
                    {project.title}
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </DialogContent>
      <ReservationForm
        dispatch={dispatch}
        state={state}
        projects={projectsWithHours}
        walkInValid={walkInValid}
        allowsEquipment={location.allowsEquipment}
      />
      {isAdmin && <ReservationFormAdmin dispatch={dispatch} state={state} />}
      {!!state.currentEvent.reservation && (
        <CancelationDialog
          broadcast={broadcast}
          state={state}
          dispatch={dispatch}
          open={cancelationDialogIsOpen}
          setOpen={setCancelationDialogIsOpen}
          cancelationApprovalCutoff={cancelationApprovalCutoff}
          gracePeriodCutoff={gracePeriodCutoff}
          isWalkIn={
            state.currentEvent.reservation.projectId ===
            currentUserWalkInProject?.id
          }
        />
      )}
    </Dialog>
  );
};

export default EventDetail;
