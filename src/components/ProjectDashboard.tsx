import React, { FunctionComponent, useContext } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  IconButton,
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
import { AuthContext } from "./AuthContext";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { getFormattedEventInterval } from "../utils/date";
import ProjectLocationHours from "./ProjectLocationHours";
import ProjectDashboardGroup from "./ProjectDashboardGroup";
import GroupDashboard from "./GroupDashboard";
import { ResourceKey } from "../resources/types";
import Event from "../resources/Event";
import EditIcon from "@material-ui/icons/Edit";
import {
  useStyles,
  compareStartDates,
  transition,
} from "../calendar/projectDashboard";

const ProjectDashboard: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useContext(AuthContext);
  const classes = useStyles();
  const {
    currentProject,
    currentGroup,
    projectDashboardIsOpen,
    resources,
  } = state;
  const events = resources[ResourceKey.Events] as Event[];
  const locations = resources[ResourceKey.Locations].filter((location) =>
    currentProject?.allotments.find((a) => a.locationId === location.id)
  );
  const isManager =
    process.env.NODE_ENV === "development" || user?.roles.includes("manager");

  const groupEvents = events.filter(
    (event) =>
      event.reservation &&
      currentGroup &&
      event.reservation.groupId === currentGroup.id
  );
  groupEvents.sort(compareStartDates);
  const now = Date.now();
  const splitPoint = groupEvents.findIndex(
    (event) => new Date(event.start).getTime() < now
  );

  return (
    <Dialog
      className={classes.root}
      fullScreen
      open={projectDashboardIsOpen}
      TransitionComponent={transition}
    >
      <GroupDashboard state={state} dispatch={dispatch} />
      <Toolbar className={classes.toolbar}>
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
        {isManager && (
          <IconButton
            onClick={(event): void => {
              event.stopPropagation();
              dispatch({
                type: CalendarAction.OpenProjectForm,
              });
            }}
          >
            <EditIcon />
          </IconButton>
        )}
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
            getFormattedEventInterval(currentProject.start, currentProject.end)}
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
              {getFormattedEventInterval(event.start, event.end)}
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
              {getFormattedEventInterval(event.start, event.end)}
            </ListItem>
          </List>
        ))}
      </Paper>
    </Dialog>
  );
};

export default ProjectDashboard;
