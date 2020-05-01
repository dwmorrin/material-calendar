import React, { FunctionComponent, Fragment } from "react";
import {
  Dialog,
  IconButton,
  Button,
  Toolbar,
  Typography,
  makeStyles,
  ListItem,
  List,
} from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import CloseIcon from "@material-ui/icons/Close";
import { compareDateOrder, getFormattedEventInterval } from "../calendar/date";
import { makeTransition } from "./Transition";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
  },
}));

const transition = makeTransition("left");

const EventDetail: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const classes = useStyles();
  if (!state.currentEvent || !state.currentEvent.location) {
    return null;
  }
  const { location, resourceId, title, start, end, open } = state.currentEvent;

  return (
    <div className={classes.paper}>
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
        <Typography component="h1">{location}</Typography>
        <Typography component="h2">{title}</Typography>
        <p>{getFormattedEventInterval(start, end)}</p>
        {open && (
          <Fragment>
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
                  type: CalendarAction.OpenReservationPage,
                  payload: { currentEvent: state.currentEvent },
                });
              }}
            >
              Reserve Block
            </Button>
            <Typography component="h3">Available to Projects:</Typography>
            <List>
              {state.projects
                .filter(
                  (project) =>
                    compareDateOrder(project.start, start) &&
                    compareDateOrder(end, project.end) &&
                    project.locationIds &&
                    project.locationIds.includes(resourceId)
                )
                .map((project) => (
                  <ListItem key={`${project.title}_list_item`}>
                    {project.title}
                  </ListItem>
                ))}
            </List>
          </Fragment>
        )}
      </Dialog>
    </div>
  );
};

export default EventDetail;
