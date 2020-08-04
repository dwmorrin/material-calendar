import React, { FunctionComponent } from "react";
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
import { compareDateOrder, getFormattedEventInterval } from "../utils/date";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import UserGroup from "../resources/UserGroup";
import ReservationForm from "./ReservationForm";
import ListSubheader from "@material-ui/core/ListSubheader";

const transition = makeTransition("left");

const EventDetail: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  if (!state.currentEvent || !state.currentEvent.location) {
    return null;
  }
  const {
    end,
    location,
    reservable,
    start,
    title,
    reservation,
  } = state.currentEvent;

  const projects = (state.resources[
    ResourceKey.Projects
  ] as Project[]).filter(({ allotments }) =>
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
            {getFormattedEventInterval(
              start as string | Date,
              end as string | Date
            )}
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
        {future && (userOwns || open) && (
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
      <ReservationForm dispatch={dispatch} state={state} />
    </Dialog>
  );
};

export default EventDetail;
