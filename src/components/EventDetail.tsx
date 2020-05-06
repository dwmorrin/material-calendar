import React, { FunctionComponent, useContext } from "react";
import {
  Dialog,
  IconButton,
  Button,
  Toolbar,
  Typography,
  makeStyles,
  ListItem,
  List,
  Paper,
} from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import CloseIcon from "@material-ui/icons/Close";
import { compareDateOrder, getFormattedEventInterval } from "../calendar/date";
import { makeTransition } from "./Transition";
import { AuthContext } from "./AuthContext";

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
  const { user } = useContext(AuthContext);
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
    projectGroupId,
    equipment,
  } = state.currentEvent;

  const projects = state.projects.filter(
    (project) =>
      compareDateOrder(project.start, start) &&
      compareDateOrder(end, project.end) &&
      project.locationIds &&
      project.locationIds.includes(resourceId)
  );
  const userOwns = projectGroupId && user?.groupIds.includes(projectGroupId);
  const future = new Date(start as string).getTime() > Date.now();
  const reservable = open && !reservationId;
  const equipmentList = equipment
    ? equipment.split(",").map((item) => item.split(";"))
    : null;

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
          {equipmentList && (
            <List>
              {equipmentList.map((item) => (
                <ListItem
                  key={item[1]}
                >{`${item[0]} ${item[1]} ${item[2]}`}</ListItem>
              ))}
            </List>
          )}
          {reservable && (
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
              Reserve Block
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
