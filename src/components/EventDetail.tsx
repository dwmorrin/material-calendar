import React, { FunctionComponent } from "react";
import {
  Dialog,
  IconButton,
  Toolbar,
  Typography,
  makeStyles,
  ListItem,
  List,
  Button,
  Paper,
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
  const {
    end,
    location,
    open,
    reservationId,
    resourceId,
    start,
    title,
  } = state.currentEvent;

  const projects = state.projects.filter(
    (project) =>
      compareDateOrder(project.start, start) &&
      compareDateOrder(end, project.end) &&
      project.locationIds &&
      project.locationIds.includes(resourceId)
  );

  const reservable = open && !reservationId;

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
        <Paper
          style={{
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <section>
            <Typography variant="h6">{location}</Typography>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="body2">
              {getFormattedEventInterval(
                start as string | Date,
                end as string | Date
              )}
            </Typography>
          </section>
          {reservable && (
            <Button
              variant="contained"
              style={{ marginBottom: 30, alignSelf: "center" }}
            >
              Book Me
            </Button>
          )}
          {reservable && (
            <section>
              <Typography component="h3">Available to</Typography>
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
      </Dialog>
    </div>
  );
};

export default EventDetail;
