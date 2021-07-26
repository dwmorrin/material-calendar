import React, { FunctionComponent, useContext, useState } from "react";
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
  nowInServerTimezone,
  parseSQLDatetime,
  sqlIntervalInHours,
} from "../utils/date";
import { AuthContext } from "./AuthContext";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import UserGroup from "../resources/UserGroup";
import ReservationForm from "./ReservationForm";
import ListSubheader from "@material-ui/core/ListSubheader";
import Event from "../resources/Event";
import { sendMail } from "../utils/mail";
import CancelationDialog from "./CancelationDialog";

const transition = makeTransition("left");

const EventDetail: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useContext(AuthContext);
  const [cancelationDialogIsOpen, openCancelationDialog] = useState(false);

  const dispatchError = (error: Error, meta?: unknown): void =>
    dispatch({ type: CalendarAction.Error, payload: { error }, meta });

  if (!state.currentEvent || !state.currentEvent.location || !user?.username) {
    return null;
  }

  const { end, location, reservable, start, title, reservation } =
    state.currentEvent;
  const userCanUseLocation = user?.restriction >= location.restriction;

  const cancelationApprovalCutoff = new Date(
    parseSQLDatetime(start).setHours(
      parseSQLDatetime(start).getHours() -
        Number(process.env.REACT_APP_CANCELATION_REFUND_CUTOFF_HOURS)
    )
  );

  const reservationCutoff = new Date(
    parseSQLDatetime(end).setMinutes(
      parseSQLDatetime(end).getMinutes() -
        Number(process.env.REACT_APP_EVENT_IN_PROGRESS_CUTOFF_MINUTES)
    )
  );

  const cancelationApproved = isBefore(
    nowInServerTimezone(),
    cancelationApprovalCutoff
  );

  const hasMetWalkInQuota = (event: Event): boolean => {
    const walkInProject = (
      state.resources[ResourceKey.Projects] as Project[]
    ).find((project) => project.title === Project.walkInTitle);
    if (walkInProject) {
      return (
        Number(process.env.REACT_APP_WALK_IN_RESERVATIONS_PER_LOCATION) >
        (state.resources[ResourceKey.Events] as Event[]).filter(
          (e) => e.location == event.location
        ).length
      );
    } else return true;
  };

  const projectHoursRemaining = (project: Project): boolean => {
    const group = (state.resources[ResourceKey.Groups] as UserGroup[]).find(
      (group) => group.projectId === project.id
    );
    if (group) {
      return (
        project.groupAllottedHours >
        (state.resources[ResourceKey.Events] as Event[])
          .filter((event) => event.reservation?.groupId == group.id)
          .map((event) => sqlIntervalInHours(event.start, event.end))
          .reduce((a, b) => a + b, 0) +
          sqlIntervalInHours(
            state.currentEvent?.start,
            state.currentEvent?.start
          )
      );
    } else return false;
  };

  const projects = (state.resources[ResourceKey.Projects] as Project[]).filter(
    (project) =>
      (title === Project.walkInTitle &&
        state.currentEvent &&
        Event.isAvailableForWalkIn(state.currentEvent) &&
        !hasMetWalkInQuota(state.currentEvent)) ||
      project.allotments.some(
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
    : null;

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
          openCancelationDialog={openCancelationDialog}
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

          {equipmentList && (
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
              onClick={(event): void => {
                event.stopPropagation();
                cancelationApproved
                  ? fetch(
                      `/api/reservations/cancel/${state.currentEvent?.reservation?.id}`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: user.id,
                          refundApproved: 1,
                        }),
                      }
                    )
                      .then((response) => response.json())
                      .then(({ error, data }) => {
                        if (error || !data) {
                          return dispatch({
                            type: CalendarAction.Error,
                            payload: { error },
                          });
                        } else {
                          const group = (
                            state.resources[ResourceKey.Groups] as UserGroup[]
                          ).find(
                            (group) =>
                              group.id ===
                              state.currentEvent?.reservation?.groupId
                          );
                          const project = (
                            state.resources[ResourceKey.Projects] as Project[]
                          ).find((project) => project.id === group?.projectId);
                          if (group) {
                            const subject =
                              "canceled a reservation for your group";
                            const body =
                              subject +
                              " for " +
                              project?.title +
                              " on " +
                              state.currentEvent?.start +
                              " in " +
                              state.currentEvent?.location.title;
                            group.members
                              .filter(
                                (member) => member.username !== user.username
                              )
                              .forEach((member) =>
                                sendMail(
                                  member.email,
                                  user.name.first +
                                    " " +
                                    user.name.last +
                                    " has " +
                                    subject,
                                  "Hello " +
                                    member.name.first +
                                    ", " +
                                    user.name.first +
                                    " " +
                                    user.name.last +
                                    " has " +
                                    body,
                                  dispatchError
                                )
                              );
                            sendMail(
                              user.email,
                              "You have " + subject,
                              "Hello " +
                                user.name.first +
                                ",  You have " +
                                body,
                              dispatchError
                            );
                          }
                        }
                      })
                  : openCancelationDialog(true);
              }}
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
        {user.roles.includes("admin") && (
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
