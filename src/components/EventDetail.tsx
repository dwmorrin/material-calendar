import React, { FunctionComponent } from "react";
import {
  Dialog,
  IconButton,
  Toolbar,
  Typography,
  makeStyles,
} from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import CloseIcon from "@material-ui/icons/Close";
import { getFormattedEventInterval } from "../calendar/date";
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
  if (!state.currentEvent) {
    return null;
  }
  const { location, title, start, end } = state.currentEvent;

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
      </Dialog>
    </div>
  );
};

export default EventDetail;
