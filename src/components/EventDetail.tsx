import React, { FunctionComponent, useEffect } from "react";
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
  compareDateOrder,
  getFormattedEventInterval,
  isSameDay,
} from "../utils/date";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import UserGroup from "../resources/UserGroup";
import ReservationForm from "./ReservationForm";
import ListSubheader from "@material-ui/core/ListSubheader";
import { deepEqual } from "fast-equals";
import Event from "../resources/Event";

const transition = makeTransition("left");

const EventDetail: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const isAvailableForWalkin = (event?: Event): boolean => {
    if (!event) {
      return false;
    }
    const now = new Date();
    const walkInStart = 8;
    const walkInEnd = 20;
    const eventInProgressCutoff = 15;
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    const sameDay = isSameDay(now, eventStart);
    const withinWalkInPeriod =
      now.getHours() >= walkInStart && now.getHours() <= walkInEnd;
    const eventWalkInAvailable = compareDateOrder(
      now,
      new Date(eventEnd.getTime() - eventInProgressCutoff * 60000)
    );
    return sameDay && withinWalkInPeriod && eventWalkInAvailable;
  };

  // Update the event when the EventDetail is opened and when reservation form is closed
  useEffect(() => {
    fetch(`/api/events/${state.currentEvent?.id}`)
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
          fetch(`/api/events`)
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
                      payload: { resources: { [ResourceKey.Events]: data } },
                      meta: ResourceKey.Events,
                    }
              )
            );
        }
      });
  }, [dispatch, state.detailIsOpen, state.reservationFormIsOpen]);
  if (!state.currentEvent || !state.currentEvent.location) {
    return null;
  }
  const { end, location, reservable, start, title, reservation } =
    state.currentEvent;

  // TODO constrain "Walk-in" to same day only
  const projects = (state.resources[ResourceKey.Projects] as Project[]).filter(
    ({ title, allotments }) =>
      (title === "Walk-in" && isAvailableForWalkin(state.currentEvent)) ||
      allotments.some(
        (a) =>
          a.locationId === location.id &&
          compareDateOrder(a.start, start) &&
          compareDateOrder(end, a.end)
      )
  );
  const open = reservable && !reservation;
  const userOwns =
    reservation &&
    (state.resources[ResourceKey.Groups] as UserGroup[]).find(
      (group) => reservation.groupId === group.id
    );
  const future = new Date(start as string).getTime() > Date.now();
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
            {getFormattedEventInterval(start, end)}
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
        </section>
        {future && (userOwns || open) && !!projects.length && (
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
      </Paper>
      <ReservationForm dispatch={dispatch} state={state} projects={projects} />
    </Dialog>
  );
};

export default EventDetail;
