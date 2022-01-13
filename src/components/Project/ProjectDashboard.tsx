import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../types";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ButtonBase,
  Dialog,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { useTheme } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  isAfter,
  nowInServerTimezone,
  parseAndFormatSQLDateInterval,
  parseAndFormatSQLDatetimeInterval,
  parseSQLDatetime,
} from "../../utils/date";
import ProjectLocationHours from "./ProjectLocationHours";
import ProjectLocationHoursLegend from "./ProjectLocationHoursLegend";
import ProjectDashboardGroup from "./ProjectDashboardGroup";
import GroupDashboard from "../GroupDashboard/GroupDashboard";
import { ResourceKey } from "../../resources/types";
import Event from "../../resources/Event";
import {
  useStyles,
  compareStartDates,
  transition,
} from "./ProjectDashboard.lib";
import fetchCurrentEvent from "../fetchCurrentEvent";
import Location from "../../resources/Location";
import Reservation from "../../resources/Reservation";
import { ProjectColors } from "./types";
import pluralize from "../../utils/pluralize";

const SessionInfo: FunctionComponent<{
  event: Event;
  onClick: React.MouseEventHandler;
}> = ({ event, onClick }) => {
  return (
    <ListItem>
      <ButtonBase onClick={onClick}>
        <ListItemText
          primary={
            event.location.title +
            " - " +
            parseAndFormatSQLDatetimeInterval(event)
          }
          secondary={event.title}
        />
      </ButtonBase>
    </ListItem>
  );
};

const ProjectDashboard: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const classes = useStyles();
  const theme = useTheme();

  const colors: ProjectColors = {
    allotment: theme.palette.primary.main,
    canceled: theme.palette.warning.dark,
    event: theme.palette.primary.light,
    now: theme.palette.secondary.main,
  };

  const { currentProject, currentGroup, projectDashboardIsOpen, resources } =
    state;

  if (!currentProject) return null;

  const events = resources[ResourceKey.Events] as Event[];
  const locations = (resources[ResourceKey.Locations] as Location[]).filter(
    (location) =>
      currentProject?.allotments.find((a) => a.locationId === location.id)
  );
  const reservations = resources[ResourceKey.Reservations] as Reservation[];

  // canceled reservations are divorced from the original event
  // so we need to pair them up to display the event info for the canceled reservation
  const canceledNotRefundedEvents: Event[] = reservations.reduce(
    (result, res) => {
      if (
        currentGroup &&
        res.groupId === currentGroup.id &&
        !!res.cancelation &&
        !Reservation.isRefunded(res)
      ) {
        const event = events.find((e) => e.id === res.eventId);
        if (event) result.push(event);
      }
      return result;
    },
    [] as Event[]
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
    dispatch({ type: CalendarAction.CloseProjectDashboard });
    dispatch({
      type: CalendarAction.OpenEventDetail,
      payload: { currentEvent: event },
    });
    fetchCurrentEvent(dispatch, event);
  };

  return (
    <Dialog
      className={classes.root}
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
          <AccordionDetails>
            <ProjectLocationHoursLegend colors={colors} />
          </AccordionDetails>
          {locations.map((location) => {
            const locationAllotments =
              currentProject?.allotments.filter(
                (a) => a.locationId === location.id
              ) || [];
            return (
              <AccordionDetails
                key={`${location.id}`}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <Typography variant="body2">{location.title}</Typography>
                <ProjectLocationHours
                  allotments={locationAllotments}
                  events={groupEvents.filter(
                    (e) => e.location.id === location.id
                  )}
                  canceledEvents={canceledNotRefundedEvents.filter(
                    (e) => e.location.id === location.id
                  )}
                  colors={colors}
                />
                <Typography variant="body2">
                  Time periods and maximum hours for all groups in this project:
                </Typography>
                <List>
                  {locationAllotments.map((a) => (
                    <ListItem key={a.start}>
                      <Typography variant="body2">
                        {parseAndFormatSQLDateInterval(a)}:{" "}
                        {pluralize(a.hours, "hour")}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            );
          })}
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
        <List>
          {groupEvents.slice(splitPoint).map((event) => (
            <SessionInfo
              key={`group_event_listing_${event.id}`}
              event={event}
              onClick={makeOpenEventDetail(event)}
            />
          ))}
        </List>
        <Typography>Previous Sessions</Typography>
        <List>
          {groupEvents.slice(0, splitPoint).map((event) => (
            <SessionInfo
              key={`group_event_listing_${event.id}`}
              event={event}
              onClick={makeOpenEventDetail(event)}
            />
          ))}
        </List>
        {!!canceledNotRefundedEvents.length && (
          <Typography>Canceled Reservations Without Refund</Typography>
        )}
        <List>
          {canceledNotRefundedEvents.map((event) => (
            <SessionInfo
              key={`group_event_listing_${event.id}`}
              event={event}
              onClick={makeOpenEventDetail(event)}
            />
          ))}
        </List>
      </Paper>
    </Dialog>
  );
};

export default ProjectDashboard;
