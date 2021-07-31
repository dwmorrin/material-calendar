import React, { FunctionComponent, useState } from "react";
import {
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
} from "../utils/date";
import { useAuth } from "./AuthProvider";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Reservation from "../resources/Reservation";
import UserGroup from "../resources/UserGroup";
import ReservationForm from "./ReservationForm";
import ListSubheader from "@material-ui/core/ListSubheader";
import Event from "../resources/Event";
import CancelationDialog from "./CancelationDialog";

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

  const { end, location, reservable, start, title, reservation } =
    state.currentEvent;
  const userCanUseLocation = user.restriction >= location.restriction;

  const startDate = parseSQLDatetime(start);
  const endDate = parseSQLDatetime(end);

  const cancelationApprovalCutoff = subHours(
    startDate,
    Reservation.rules.refundCutoffHours
  );

  const reservationCutoff = subHours(
    endDate,
    Reservation.rules.refundCutoffHours
  );

  const cancelationApproved = isBefore(
    nowInServerTimezone(),
    cancelationApprovalCutoff
  );

  const currentUserWalkInProject = user.projects.find(
    (project) => project.title === Project.walkInTitle
  );

  // returns true if there is no walk-in project
  const hasReachedTheWalkInLimit = (event: Event): boolean => {
    if (!currentUserWalkInProject) return true;
    const myReservations = events.filter(
      ({ location, reservation }) =>
        location === event.location &&
        isSameDay(parseSQLDatetime(event.start), nowInServerTimezone()) &&
        reservation &&
        reservation.groupId === currentUserWalkInProject.id
    ).length;
    return Reservation.rules.maxWalkInsPerLocation <= myReservations;
  };

  const projectHoursRemaining = (project: Project): boolean => {
    const group = (state.resources[ResourceKey.Groups] as UserGroup[]).find(
      (group) => group.projectId === project.id
    );
    if (!group) return false;
    const thisEventHours = sqlIntervalInHours(start, end);
    const sumOfGroupHours = (state.resources[ResourceKey.Events] as Event[])
      .filter(({ reservation }) => reservation?.groupId === group.id)
      .map((event) => sqlIntervalInHours(event.start, event.end))
      .reduce((a, b) => a + b);
    return project.groupAllottedHours > sumOfGroupHours + thisEventHours;
  };

  const projects = (state.resources[ResourceKey.Projects] as Project[]).filter(
    ({ title, allotments }) =>
      (title === Project.walkInTitle &&
        state.currentEvent &&
        Event.isAvailableForWalkIn(state.currentEvent) &&
        !hasReachedTheWalkInLimit(state.currentEvent)) ||
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
    reservationCutoff
  );

  const eventHasNotEnded = isBefore(
    nowInServerTimezone(),
    parseSQLDatetime(end)
  );
  const equipmentList = reservation?.equipment
    ? Object.entries(reservation.equipment)
    : [];

  const onCancel = (event: React.MouseEvent): void => {
    event.stopPropagation();
    if (!cancelationApproved) return setCancelationDialogIsOpen(true);
    const group = (state.resources[ResourceKey.Groups] as UserGroup[]).find(
      (group) => group.id === state.currentEvent?.reservation?.groupId
    );
    if (!group) throw new Error("No group");
    const project = (state.resources[ResourceKey.Projects] as Project[]).find(
      (project) => project.id === group?.projectId
    );
    if (!project) throw new Error("No project");
    const { currentEvent } = state;
    if (!currentEvent) throw new Error("No current event");
    const groupEmail = group.members.map(({ email }) => email).join(", ");
    const whatWhenWhere = `${project.title} on ${currentEvent.start} in ${location}`;
    const subject = "canceled a reservation for your group";
    const body = `${subject} for ${whatWhenWhere}`;

    fetch(`/api/reservations/cancel/${state.currentEvent?.reservation?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        refundApproved: 1,
        mailbox: [{ to: groupEmail, subject, text: body }],
      }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error || !data)
          return dispatch({ type: CalendarAction.Error, payload: { error } });
        // remove the reservation from state
        const currentEvent = new Event(data.event);
        const events = (state.resources[ResourceKey.Events] as Event[]).filter(
          ({ id }) => id !== currentEvent.id
        );
        const reservations = (
          state.resources[ResourceKey.Reservations] as Reservation[]
        ).filter(({ id }) => id !== reservation?.id);
        dispatch({
          type: CalendarAction.ReceivedReservationCancelation,
          payload: {
            currentEvent,
            resources: {
              [ResourceKey.Events]: [...events, currentEvent],
              [ResourceKey.Reservations]: [...reservations],
            },
          },
        });
      });
  };

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
      {cancelationDialogIsOpen && (
        <CancelationDialog
          state={state}
          dispatch={dispatch}
          cancelationDialogIsOpen={cancelationDialogIsOpen}
          setCancelationDialogIsOpen={setCancelationDialogIsOpen}
          cancelationApprovalCutoff={cancelationApprovalCutoff}
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

          {equipmentList.length && (
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
              {userOwns ? "Modify Reservation" : "Reserve this time"}
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
              onClick={onCancel}
            >
              Cancel Reservation
            </Button>
          </div>
        )}
        {open && (
          <section>
            <Typography component="h3">
              {projects.length
                ? "Available for"
                : "Not available to any of your projects"}
            </Typography>
            <List>
              {projects.map((project) => (
                <ListItem key={`${project.title}_list_item`}>
                  {projectHoursRemaining(project)
                    ? project.title
                    : project.title + ", NO Project Hours Remaining"}
                </ListItem>
              ))}
            </List>
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
        projects={projects.filter(projectHoursRemaining)}
      />
    </Dialog>
  );
};

export default EventDetail;
