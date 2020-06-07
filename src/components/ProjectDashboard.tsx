import React, {
  FunctionComponent,
  useEffect,
  useContext,
  useState,
} from "react";
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
import { AuthContext } from "./AuthContext";
import { makeTransition } from "./Transition";
import { getFormattedEventInterval } from "../calendar/date";
import { ProjectLocationAllotment } from "../resources/Project";
import ProjectLocationHours from "./ProjectLocationHours";
import { fetchCalendarData } from "../calendar/Fetch";
import ProjectDashboardGroup from "./ProjectDashboardGroup";
import GroupDashboard from "./GroupDashboard";

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
const initialAllotments: ProjectLocationAllotment[][] = [];

const ProjectDashboard: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const classes = useStyles();
  const [allotments, setAllotments] = useState(initialAllotments);
  const { currentProject } = state;
  const locations = state.locations.filter((location) =>
    currentProject?.locationIds.includes(location.id)
  );

  useEffect(() => {
    if (!currentProject) {
      return;
    }
    const requests = currentProject.childrenIds.map((id) =>
      fetch(`/api/project_location_allotment/${id}`)
    );
    Promise.all(requests)
      .then((responses) => {
        Promise.all(responses.map((res) => res.json()))
          .then((locations) => setAllotments(locations))
          .catch(console.error);
      })
      .catch(console.error);
  }, [currentProject]);

  const groupEvents = state.events.filter(
    (event) => event.projectGroupId === state.currentGroup?.id
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
          Managed by {currentProject && currentProject.manager}
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
              <Typography variant="body2">{location.title}</Typography>
              <ProjectLocationHours
                // extracts one allotments[] from allotments[][]
                allotments={
                  allotments.filter((a) => a[0].locationId === location.id)[0]
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
                type: CalendarAction.ViewEventDetail,
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
                type: CalendarAction.ViewEventDetail,
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
