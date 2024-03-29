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
  addHours,
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
import { useSocket } from "../SocketProvider";
import { getRange } from "../../resources/EventsByDate";

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
  const { isAdmin, isStaff, user } = useAuth();
  const { broadcast } = useSocket();
  const [cancelationDialogIsOpen, setCancelationDialogIsOpen] = useState(false);
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const [usedHours, setUsedHours] = useState<ProjectHours[]>(
    projects.map(({ id }) => ({ id }))
  );
  const [checkingIn, setCheckingIn] = useState(false);

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
    Promise.all(urls.map((url) => fetch(url).then((r) => r.json())))
      .then((hours) => setUsedHours(hours as ProjectHours[]))
      .catch((error) =>
        dispatch({ type: CalendarAction.Error, payload: { error } })
      )
      .catch((error) =>
        dispatch({ type: CalendarAction.Error, payload: { error } })
      );
  }, [dispatch, projects, state.currentEvent]);

  // if the event is locked, try to unlock it
  // pull the values out of the object to avoid useEffect infinite loop
  const eventId = state.currentEvent?.id || 0;
  const eventIsLocked = state.currentEvent?.locked || false;
  useEffect(() => {
    if (!eventIsLocked) return;
    fetch(`${Event.url}/${eventId}/unlock`, { method: "POST" })
      .then((res) => res.json())
      .then(({ error, data }) => {
        if (error)
          return dispatch({ type: CalendarAction.Error, payload: { error } });
        if (!data?.event)
          return dispatch({
            type: CalendarAction.Error,
            payload: {
              error: new Error(
                "Something went wrong in trying to access the event on the server."
              ),
            },
          });
        // event has been unlocked; update state
        dispatch({
          type: CalendarAction.FoundStaleCurrentEvent,
          payload: { currentEvent: new Event(data.event as Event) },
        });
      })
      .catch((error) =>
        dispatch({ type: CalendarAction.Error, payload: { error } })
      );
  }, [dispatch, eventIsLocked, eventId]);

  if (!state.currentEvent || !state.currentEvent.location || !user.username) {
    return null;
  }

  const currentEvent: Event = state.currentEvent;

  const events = state.resources[ResourceKey.Events] as Event[];
  const reservations = state.resources[
    ResourceKey.Reservations
  ] as Reservation[];

  const { end, location, locked, reservable, reservation, start, title } =
    currentEvent;

  const eventsByDate = getRange(state.events, [location.id], start, end);
  const aggregateEvent = eventsByDate.find((e) => e.id === currentEvent.id);
  if (!aggregateEvent) return null;
  const subEvents = Event.subEvents(aggregateEvent);

  const checkIn = (): void => {
    if (!(isAdmin || isStaff)) return;
    if (!reservation || !reservation.id) return;
    setCheckingIn(true);
    fetch(Reservation.checkInUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primaryReservationId: reservation.id,
        reservationIds: subEvents
          .filter(({ reservation }) => reservation && reservation.id)
          .map(({ reservation }) => reservation?.id),
      }),
    })
      .then((res) => res.json())
      .then(({ error, data }) => {
        if (error)
          return dispatch({ type: CalendarAction.Error, payload: { error } });
        if (!data || !Array.isArray(data.events))
          return dispatch({
            type: CalendarAction.Error,
            payload: { error: new Error("Updated events not returned") },
          });
        const updatedEvents = (data.events as Event[]).map((e) => new Event(e));
        const updatedCurrentEvent = updatedEvents.find(
          (e) => e.id === currentEvent.id
        );
        dispatch({
          type: CalendarAction.ReceivedReservationCheckIn,
          payload: {
            currentEvent: updatedCurrentEvent,
            resources: {
              [ResourceKey.Events]: updatedEvents,
            },
          },
        });
      })
      .catch((error) =>
        dispatch({ type: CalendarAction.Error, payload: { error } })
      )
      .finally(() => setCheckingIn(false));
  };

  const reCheckIn = (): void => {
    if (window.confirm(process.env.REACT_APP_STR_RESUBMIT_CHECK_IN)) checkIn();
  };

  const userCanUseLocation = user.restriction >= location.restriction;

  const endDate = parseSQLDatetime(end);

  const currentUserWalkInProject = projects.find(
    (project) => project.title === Project.walkInTitle
  );

  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const currentUserWalkInProjectGroup = groups.find(
    (group) => group.projectId === currentUserWalkInProject?.id
  );

  const now = nowInServerTimezone();
  const walkInReservationsToday: Reservation[] =
    state.currentEvent && currentUserWalkInProjectGroup
      ? reservations.filter(
          (reservation) =>
            // ignore refunded
            Reservation.isNotRefunded(reservation) &&
            // ignore non-walk-in reservations
            reservation.groupId === currentUserWalkInProjectGroup.id &&
            // ignore other location groups
            events.find((e) => e.id === reservation.eventId)?.location
              .groupId === state.currentEvent?.location.groupId &&
            // ignore other days
            isSameDay(
              parseSQLDatetime(
                events.find((event) => event.id === reservation.eventId)
                  ?.start || "1900-01-01 00:00:00"
              ),
              now
            )
        )
      : [];
  const hotReservations: Reservation[] = walkInReservationsToday.filter(
    (reservation) =>
      isBefore(
        now,
        addHours(
          parseSQLDatetime(reservation.created),
          Number(process.env.REACT_APP_WALK_IN_COOLING_OFF_HOURS || 2)
        )
      )
  );
  const hasReachedTheWalkInLimit =
    Reservation.rules.maxWalkInsPerLocation <= hotReservations.length;

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
    Event.isAvailableForWalkIn(state.currentEvent) && !hasReachedTheWalkInLimit;

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

  const eventHasNotEnded = isBefore(nowInServerTimezone(), endDate);

  const reservationHasNotEnded = isBefore(
    nowInServerTimezone(),
    parseSQLDatetime(aggregateEvent.end)
  );
  const someEventsNotStarted = subEvents.some((e) => Event.notStarted(e));
  const someEventsInGracePeriod = subEvents.some((e) => Event.inGracePeriod(e));

  const notStartedOrInGracePeriod =
    someEventsNotStarted || someEventsInGracePeriod;

  const equipmentList = reservation?.equipment
    ? Object.entries(reservation.equipment)
    : [];

  enum ProjectSorterIndex {
    withHours = 0,
    withoutHours = 1,
    withoutGroups = 2,
  }
  const [projectsWithHours, projectsWithoutHours, projectsWithoutGroups] =
    projectsActiveNow.reduce(
      (projectsByHours, p) => {
        const group = getProjectGroup(p);
        if (!group || group.pending)
          projectsByHours[ProjectSorterIndex.withoutGroups].push(p);
        else if (projectGroupHasHoursRemaining(p, group))
          projectsByHours[ProjectSorterIndex.withHours].push(p);
        else projectsByHours[ProjectSorterIndex.withoutHours].push(p);
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
          {subEvents.map(({ start, originalEnd, id }) => (
            <Typography key={`sub-event-${id}`} variant="body2">
              {parseAndFormatSQLDatetimeInterval({ start, end: originalEnd })}
            </Typography>
          ))}
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
              hotReservations={hotReservations}
            />
            {((isAdmin && reservation && reservationHasNotEnded) ||
              (userOwns && notStartedOrInGracePeriod)) && (
              <Button
                variant="contained"
                color="secondary"
                key="CancelReservation"
                onClick={(): void => setCancelationDialogIsOpen(true)}
              >
                Cancel Reservation
              </Button>
            )}
            {reservation && (isAdmin || isStaff) && (
              <p>
                Reservation created on:{" "}
                {parseSQLDatetime(reservation.created).toLocaleString()}
              </p>
            )}
            {isAdmin || isStaff ? (
              reservation &&
              (reservation.checkIn ? (
                <Button
                  disabled={locked || checkingIn}
                  variant="contained"
                  onClick={(): void => reCheckIn()}
                >
                  {process.env.REACT_APP_STR_YES_CHECK_IN} on{" "}
                  {parseSQLDatetime(reservation.checkIn).toLocaleString()}
                </Button>
              ) : eventHasNotEnded ? (
                <Button
                  disabled={locked || checkingIn}
                  variant="contained"
                  onClick={(): void => checkIn()}
                >
                  {checkingIn
                    ? process.env.REACT_APP_STR_CHECK_IN_BTN_WAIT
                    : process.env.REACT_APP_STR_CHECK_IN_BTN}
                </Button>
              ) : (
                <Typography variant="body2">
                  {process.env.REACT_APP_STR_NO_CHECK_IN}
                </Typography>
              ))
            ) : userOwns && reservation && reservation.checkIn ? (
              <Typography variant="body2">
                {process.env.REACT_APP_STR_YES_CHECK_IN} on{" "}
                {parseSQLDatetime(reservation.checkIn).toLocaleString()}
              </Typography>
            ) : null}
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
                These projects are unavailable in this location at this time:
                (open project page for more info)
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
          isWalkIn={
            state.currentEvent.reservation.projectId ===
            currentUserWalkInProject?.id
          }
          subEvents={subEvents}
        />
      )}
    </Dialog>
  );
};

export default EventDetail;
