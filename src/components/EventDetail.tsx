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
    ? reservation.equipment.split(",").map((item) => item.split(";"))
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
        </section>
        {equipmentList && (
          <List>
            {equipmentList.map(([description, sku, quantity]) => (
              <ListItem
                key={sku}
              >{`${description} ${sku} ${quantity}`}</ListItem>
            ))}
          </List>
        )}
        {open && (
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
            Reserve this time
          </Button>
        )}
        {userOwns && future && (
          <div>
            <Button
              variant="contained"
              style={{ marginBottom: 30, alignSelf: "center" }}
            >
              Reserve equipment
            </Button>
            <Button
              variant="contained"
              style={{ marginBottom: 30, alignSelf: "center" }}
            >
              Cancel this reservation
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
