import React, { FunctionComponent, useState } from "react";
import {
  Box,
  Dialog,
  IconButton,
  Button,
  Toolbar,
  Typography,
  ListItem,
  List,
  Paper,
} from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import CloseIcon from "@material-ui/icons/Close";
import {
  castSQLDateToSQLDatetime,
  isValidSQLDatetimeInterval,
  parseAndFormatSQLDatetimeInterval,
  isBefore,
  isSameDay,
  nowInServerTimezone,
  parseSQLDatetime,
  sqlIntervalInHours,
  subHours,
  subMinutes,
} from "../utils/date";
import { useAuth } from "./AuthProvider";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Reservation from "../resources/Reservation";
import UserGroup from "../resources/UserGroup";
import ReservationForm from "./ReservationForm/ReservationForm";
import ReservationFormAdmin from "./ReservationForm/ReservationFormAdmin";
import ListSubheader from "@material-ui/core/ListSubheader";
import Event from "../resources/Event";
import CancelationDialog from "./CancelationDialog";
import { addMinutes } from "date-fns/esm";

const transition = makeTransition("left");

const EventDetail: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { isAdmin, user } = useAuth();
  const [cancelationDialogIsOpen, setCancelationDialogIsOpen] = useState(false);

  if (!state.currentEvent || !state.currentEvent.location || !user.username) {
    return null;
  }

  const events = state.resources[ResourceKey.Events] as Event[];
  const reservations = state.resources[
    ResourceKey.Reservations
  ] as Reservation[];
  const myEvents = reservations.map(
    ({ eventId }) => events.find(({ id }) => eventId === id) || new Event()
  );

  const { end, location, reservable, start, title, reservation } =
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

  const currentUserWalkInProject = user.projects.find(
    (project) => project.title === Project.walkInTitle
  );

  // returns true if there is no walk-in project
  const hasReachedTheWalkInLimit = (event: Event): boolean => {
    if (!currentUserWalkInProject) return true;
    const now = nowInServerTimezone();
    const myReservations = myEvents.filter(
      ({ location, reservation }) =>
        location.groupId === event.location.groupId &&
        isSameDay(parseSQLDatetime(event.start), now) &&
        reservation &&
        reservation.groupId === currentUserWalkInProject.groupId
    ).length;
    return Reservation.rules.maxWalkInsPerLocation <= myReservations;
  };

  const projectHasHoursRemaining = (project: Project): boolean => {
    const group = (state.resources[ResourceKey.Groups] as UserGroup[]).find(
      (group) => group.projectId === project.id
    );
    if (!group) return false;
    const thisEventHours = sqlIntervalInHours(start, end);
    return project.groupAllottedHours > group.reservedHours + thisEventHours;
  };

  const walkInValid =
    Event.isAvailableForWalkIn(state.currentEvent) &&
    !hasReachedTheWalkInLimit(state.currentEvent);

  const projects = (state.resources[ResourceKey.Projects] as Project[]).filter(
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
            start: end,
            end: castSQLDateToSQLDatetime(a.end),
          })
      )
  );

  const open = reservable && !reservation && userCanUseLocation;
  const userOwns =
    reservation &&
    (state.resources[ResourceKey.Groups] as UserGroup[]).find(
      (group) => reservation.groupId === group.id
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

  const [projectsWithHours, projectsWithoutHours] = projects.reduce(
    (projectsByHours, p) => {
      projectsByHours[projectHasHoursRemaining(p) ? 0 : 1].push(p);
      return projectsByHours;
    },
    [[], []] as [Project[], Project[]]
  );

  return (
    <Dialog
      fullScreen
      open={state.detailIsOpen}
      TransitionComponent={transition}
    >
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
      </Toolbar>
      {!!state.currentEvent.reservation && (
        <CancelationDialog
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
      <Paper
        style={{
          display: "flex",
          flexGrow: 1,
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <section>
          <Typography variant="h6">{location.title}</Typography>
          <Typography variant="h5">{title}</Typography>
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
        </section>

        {reservationCutoffHasNotPassed &&
          (userOwns || (open && !!projects.length)) && (
            <Button
              key="MakeReservation"
              style={{
                backgroundColor: "Green",
                color: "white",
                maxWidth: "400px",
              }}
              onClick={(event): void => {
                event.stopPropagation();
                dispatch({
                  type: CalendarAction.OpenReservationForm,
                  payload: { currentEvent: state.currentEvent },
                });
              }}
            >
              {userOwns
                ? "Modify Reservation"
                : walkInValid
                ? "Reserve Walk-In Time"
                : "Reserve this time"}
            </Button>
          )}
        {userOwns && eventHasNotEnded && (
          <div>
            <Button
              key="CancelReservation"
              style={{
                backgroundColor: "Red",
                color: "white",
                maxWidth: "400px",
              }}
              onClick={(): void => setCancelationDialogIsOpen(true)}
            >
              Cancel Reservation
            </Button>
          </div>
        )}
        {open && !walkInValid && (
          <section>
            <Typography component="h3">
              {projectsWithHours.length
                ? "Available for"
                : "Not available to any of your projects"}
            </Typography>
            <List>
              {projectsWithHours.map((project) => (
                <ListItem key={`${project.title}_list_item`}>
                  {project.title}
                </ListItem>
              ))}
            </List>
            {!!projectsWithoutHours.length && (
              <>
                <Typography component="h3">
                  These projects have no hours remaining:
                </Typography>
                <List>
                  {projectsWithoutHours.map((project) => (
                    <ListItem key={`${project.title}_list_item`}>
                      <Box fontStyle="oblique">{project.title}</Box>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </section>
        )}
        {isAdmin && (
          <Button
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
      </Paper>
      <ReservationForm
        dispatch={dispatch}
        state={state}
        projects={projects.filter(projectHasHoursRemaining)}
      />
      {isAdmin && (
        <Button
          onClick={(): void =>
            dispatch({ type: CalendarAction.OpenReservationFormAdmin })
          }
        >
          ADMIN RESERVATION FORM
        </Button>
      )}
      {isAdmin && <ReservationFormAdmin dispatch={dispatch} state={state} />}
    </Dialog>
  );
};

export default EventDetail;
