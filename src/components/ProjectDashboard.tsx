import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  IconButton,
  Dialog,
  Toolbar,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
} from "@material-ui/core";
import { useAuth } from "./AuthProvider";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  isAfter,
  nowInServerTimezone,
  parseAndFormatSQLDateInterval,
  parseAndFormatSQLDatetimeInterval,
  parseSQLDatetime,
} from "../utils/date";
import ProjectLocationHours from "./ProjectLocationHours";
import ProjectDashboardGroup from "./ProjectDashboardGroup";
import GroupDashboard from "./GroupDashboard/GroupDashboard";
import { ResourceKey } from "../resources/types";
import Event from "../resources/Event";
import {
  useStyles,
  compareStartDates,
  transition,
} from "../calendar/projectDashboard";
import fetchCurrentEvent from "../calendar/fetchCurrentEvent";

const SessionInfo: FunctionComponent<{
  event: Event;
  onClick: React.MouseEventHandler<HTMLUListElement>;
}> = ({ event, onClick }) => {
  return (
    <List onClick={onClick}>
      <ListItem>
        <ListItemText
          primary={
            event.location.title +
            " - " +
            parseAndFormatSQLDatetimeInterval(event)
          }
          secondary={event.title}
        />
      </ListItem>
    </List>
  );
};

const ProjectDashboard: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useAuth();
  const classes = useStyles();
  const { currentProject, currentGroup, projectDashboardIsOpen, resources } =
    state;

  if (!user || !currentProject) return null;

  const events = resources[ResourceKey.Events] as Event[];
  const locations = resources[ResourceKey.Locations].filter((location) =>
    currentProject?.allotments.find((a) => a.locationId === location.id)
  );

  const groupEvents = events.filter(
    (event) =>
      event.reservation &&
      currentGroup &&
      event.reservation.groupId === currentGroup.id
  );
  groupEvents.sort(compareStartDates);
  const now = nowInServerTimezone();
  const splitPoint = groupEvents.findIndex(({ start }) =>
    isAfter(parseSQLDatetime(start), now)
  );

  const makeOpenEventDetail = (event: Event) => (): void => {
    dispatch({
      type: CalendarAction.OpenEventDetail,
      payload: { currentEvent: event },
    });
    fetchCurrentEvent(dispatch, event);
  };

  return (
    <Dialog
      className={classes.root}
      fullScreen
      open={projectDashboardIsOpen}
      TransitionComponent={transition}
    >
      {state.groupDashboardIsOpen && (
        <GroupDashboard state={state} dispatch={dispatch} />
      )}
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
          {parseAndFormatSQLDateInterval(currentProject)}
        </Typography>
        <Accordion defaultExpanded={locations.length === 1}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body1">Location Hours</Typography>
          </AccordionSummary>
          {locations.map((location) => (
            <AccordionDetails
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
            </AccordionDetails>
          ))}
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body1">Group Info</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ProjectDashboardGroup dispatch={dispatch} state={state} />
          </AccordionDetails>
        </Accordion>
        <Typography>Upcoming Sessions</Typography>
        {groupEvents.slice(0, splitPoint).map((event) => (
          <SessionInfo
            key={`group_event_listing_${event.id}`}
            event={event}
            onClick={makeOpenEventDetail(event)}
          />
        ))}
        <Typography>Previous Sessions</Typography>
        {groupEvents.slice(splitPoint).map((event) => (
          <SessionInfo
            key={`group_event_listing_${event.id}`}
            event={event}
            onClick={makeOpenEventDetail(event)}
          />
        ))}
      </Paper>
    </Dialog>
  );
};

export default ProjectDashboard;
