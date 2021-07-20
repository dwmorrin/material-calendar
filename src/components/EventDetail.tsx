import React, { FunctionComponent, useEffect, useContext } from "react";
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
  compareAscSQLDatetime,
  parseAndFormatSQLDatetimeInterval,
  isBefore,
  nowInServerTimezone,
  parseSQLDatetime,
} from "../utils/date";
import { AuthContext } from "./AuthContext";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import UserGroup from "../resources/UserGroup";
import ReservationForm from "./ReservationForm";
import ListSubheader from "@material-ui/core/ListSubheader";
import { deepEqual } from "fast-equals";
import Event from "../resources/Event";
import { sendMail } from "../utils/mail";

const transition = makeTransition("left");

const EventDetail: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useContext(AuthContext);

  // Update the event when the EventDetail is opened and when reservation form is closed
  useEffect(() => {
    if (state.currentEvent?.id)
      fetch(`${Event.url}/${state.currentEvent.id}`)
        .then((res) => res.json())
        .then(({ error, data, context }) => {
          if (error || !data) {
            return dispatch({
              type: CalendarAction.Error,
              payload: { error },
              meta: context,
            });
          }
          // Compare the contents of the events
          if (!deepEqual(data[0], state.currentEvent)) {
            // events out of date, updating
            fetch(Event.url)
              .then((res) => res.json())
              .then(({ error, data, context }) =>
                dispatch(
                  error || !data
                    ? {
                        type: CalendarAction.Error,
                        payload: { error },
                        meta: context,
                      }
                    : {
                        type: CalendarAction.UpdateEvents,
                        payload: {
                          resources: {
                            [ResourceKey.Events]: data.map(
                              (e: Event) => new Event(e)
                            ),
                          },
                        },
                        meta: ResourceKey.Events,
                      }
                )
              );
          }
        });
  }, [dispatch, state.detailIsOpen, state.reservationFormIsOpen]);

  if (!state.currentEvent || !state.currentEvent.location || !user?.username) {
    return null;
  }

  const { end, location, reservable, start, title, reservation } =
    state.currentEvent;
  const userCanUseLocation = user?.restriction >= location.restriction;

  const projects = (state.resources[ResourceKey.Projects] as Project[]).filter(
    ({ title, allotments }) =>
      (title === Project.walkInTitle &&
        Event.isAvailableForWalkIn(state.currentEvent)) ||
      allotments.some(
        (a) =>
          a.locationId === location.id &&
          compareAscSQLDatetime({
            start: castSQLDateToSQLDatetime(a.start),
            end: start,
          }) &&
          compareAscSQLDatetime({
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
  // Should start be changed to end? or end-15 minutes?
  const future = isBefore(nowInServerTimezone(), parseSQLDatetime(start));
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
            <Typography component="h5">
              You are not authorized to access this space
            </Typography>
          )}
        </section>

        {(userOwns || open) && !!projects.length && (
          <Button
            key="MakeBooking"
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
        {userOwns && future && (
          <div>
            <Button
              key="CancelBooking"
              style={{
                backgroundColor: "Red",
                color: "white",
                maxWidth: "400px",
              }}
              onClick={(event): void => {
                event.stopPropagation();
                fetch(
                  `/api/reservations/${state.currentEvent?.reservation?.id}`,
                  {
                    method: "DELETE",
                    headers: {},
                    body: null,
                  }
                )
                  .then((response) => response.json())
                  .then(({ error, data, context }) => {
                    if (error || !data) {
                      return dispatch({
                        type: CalendarAction.Error,
                        payload: { error },
                        meta: context,
                      });
                    } else {
                      const group = (
                        state.resources[ResourceKey.Groups] as UserGroup[]
                      ).find(
                        (group) =>
                          group.id === state.currentEvent?.reservation?.groupId
                      );
                      const project = (
                        state.resources[ResourceKey.Projects] as Project[]
                      ).find((project) => project.id === group?.projectId);
                      if (group) {
                        const subject = "canceled a reservation for your group";
                        const body =
                          subject +
                          " for " +
                          project?.title +
                          " on " +
                          state.currentEvent?.start +
                          " in " +
                          state.currentEvent?.location.title;
                        group.members
                          .filter((member) => member.username !== user.username)
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
                              dispatch
                            )
                          );
                        sendMail(
                          user.email,
                          "You have " + subject,
                          "Hello " + user.name.first + ",  You have " + body,
                          dispatch
                        );
                      }
                      dispatch({ type: CalendarAction.CanceledReservation });
                    }
                  });
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
                  {project.title}
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
      <ReservationForm dispatch={dispatch} state={state} projects={projects} />
    </Dialog>
  );
};

export default EventDetail;
