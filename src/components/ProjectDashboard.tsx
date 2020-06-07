import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  IconButton,
  makeStyles,
  Dialog,
  Toolbar,
  Typography,
  Paper,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  List,
  ListItem,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeTransition } from "./Transition";
import { getFormattedEventInterval } from "../utils/date";
import ProjectLocationHours from "./ProjectLocationHours";
import ProjectDashboardGroup from "./ProjectDashboardGroup";
import GroupDashboard from "./GroupDashboard";
import { ResourceKey } from "../resources/types";
import Event from "../resources/Event";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  hoursBar: {
    margin: theme.spacing(1),
    height: 10,
  },
}));

const transition = makeTransition("right");

const ProjectDashboard: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const classes = useStyles();
  const { currentProject } = state;
  const locations = state.resources[ResourceKey.Locations].filter((location) =>
    currentProject?.allotments.find((a) => a.locationId === location.id)
  );

  const groupEvents = (state.resources[ResourceKey.Events] as Event[]).filter(
    (event) =>
      event.reservation &&
      state.currentGroup &&
      event.reservation.groupId === state.currentGroup.id
  );
  groupEvents.sort((a, b) => {
    if (typeof a.start !== "string" || typeof b.start !== "string") return 0;
    const _a = new Date(a.start).getTime();
    const _b = new Date(b.start).getTime();
    if (_a < _b) return 1;
    if (_a > _b) return -1;
    return 0;
  });
  const now = Date.now();
  const splitPoint = groupEvents.findIndex((event) => {
    if (typeof event.start !== "string") return false;
    return new Date(event.start).getTime() < now;
  });

  return (
    <Dialog
      className={classes.root}
      fullScreen
      open={state.projectDashboardIsOpen}
      TransitionComponent={transition}
    >
      <GroupDashboard state={state} dispatch={dispatch} />
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseProjectDashboard })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography>{currentProject?.title}</Typography>
      </Toolbar>
      <Paper
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          // justifyContent: "space-between",
        }}
      >
        <Typography variant="body2">
          {currentProject &&
            getFormattedEventInterval(
              currentProject?.start as string | Date,
              currentProject?.end as string | Date
            )}
        </Typography>
        <Typography variant="body2">
          Managed by {currentProject && currentProject.managers.join(", ")}
        </Typography>
        <ExpansionPanel defaultExpanded={locations.length === 1}>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body1">Location Hours</Typography>
          </ExpansionPanelSummary>
          {locations.map((location) => (
            <ExpansionPanelDetails
              key={`${location.id}`}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <Typography variant="body2">
                {location.title as string}
              </Typography>
              <ProjectLocationHours
                allotments={
                  currentProject?.allotments.filter(
                    (a) => a.locationId === location.id
                  ) || []
                }
              />
            </ExpansionPanelDetails>
          ))}
        </ExpansionPanel>
        <ExpansionPanel defaultExpanded>
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body1">Group Info</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <ProjectDashboardGroup dispatch={dispatch} state={state} />
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <Typography>Upcoming Sessions</Typography>
        {groupEvents.slice(0, splitPoint).map((event) => (
          <List
            key={`group_event_listing_${event.id}`}
            onClick={(): void =>
              dispatch({
                type: CalendarAction.OpenEventDetail,
                payload: { currentEvent: event },
              })
            }
          >
            <ListItem>{event.title}</ListItem>
            <ListItem>
              {getFormattedEventInterval(
                event.start as string,
                event.end as string
              )}
            </ListItem>
          </List>
        ))}
        <Typography>Previous Sessions</Typography>
        {groupEvents.slice(splitPoint).map((event) => (
          <List
            key={`group_event_listing_${event.id}`}
            onClick={(): void =>
              dispatch({
                type: CalendarAction.OpenEventDetail,
                payload: { currentEvent: event },
              })
            }
          >
            <ListItem>{event.title}</ListItem>
            <ListItem>
              {getFormattedEventInterval(
                event.start as string,
                event.end as string
              )}
            </ListItem>
          </List>
        ))}
      </Paper>
    </Dialog>
  );
};

export default ProjectDashboard;
