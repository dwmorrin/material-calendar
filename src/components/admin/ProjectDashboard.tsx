import React, { FunctionComponent, useState } from "react";
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
  Select,
  MenuItem,
} from "@material-ui/core";
import { AdminAction, AdminUIProps } from "./types";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import {
  isAfter,
  nowInServerTimezone,
  parseAndFormatSQLDateInterval,
  parseAndFormatSQLDatetimeInterval,
  parseSQLDatetime,
} from "../../utils/date";
import ProjectLocationHours from "../Project/ProjectLocationHours";
import { ResourceKey } from "../../resources/types";
import Event from "../../resources/Event";
import {
  useStyles,
  compareStartDates,
  transition,
} from "../Project/ProjectDashboard.lib";
import Project from "../../resources/Project";
import UserGroup from "../../resources/UserGroup";
import ProjectDashboardGroup from "./ProjectDashboardGroup";
import User from "../../resources/User";

const colors = {
  allotment: "#3F51B5", // matching color of the linear progress bar
  event: "limegreen",
  now: "red",
  canceled: "purple",
};

const SessionInfo: FunctionComponent<{ event: Event }> = ({ event }) => {
  return (
    <List>
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
interface DashboardSelections {
  projectId: number;
  groupId: number;
}

/**
 * Allow the admin to view any group's dashboard.
 * TODO: store selected project/group in local storage
 * for now we will just store project/group in component state
 */
const ProjectDashboard: FunctionComponent<AdminUIProps> = ({
  dispatch,
  state,
}) => {
  const [selections, setSelections] = useState<DashboardSelections>({
    projectId: 0,
    groupId: 0,
  });
  const classes = useStyles();
  const { resources } = state;

  const projects = state.resources[ResourceKey.Projects] as Project[];
  const currentProject =
    projects.find(({ id }) => id === selections.projectId) ||
    projects[0] ||
    new Project();
  if (currentProject.id !== selections.projectId && currentProject.id > 0)
    setSelections({ ...selections, projectId: currentProject.id });
  const groups = (state.resources[ResourceKey.Groups] as UserGroup[]).filter(
    ({ projectId }) => projectId === currentProject.id
  );
  const currentGroup =
    groups.find(({ id }) => id === selections.groupId) ||
    groups[0] ||
    new UserGroup();
  if (currentGroup.id !== selections.groupId && currentGroup.id > 0)
    setSelections({ ...selections, groupId: currentGroup.id });
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

  return (
    <Dialog
      className={classes.root}
      fullScreen
      open={state.userGroupDashboardIsOpen}
      TransitionComponent={transition}
    >
      <Toolbar className={classes.toolbar}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: AdminAction.CloseUserGroupDashboard })
          }
        >
          <CloseIcon />
        </IconButton>
      </Toolbar>
      <Paper
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Select
          value={currentProject.id}
          onChange={({ target: { value } }): void =>
            setSelections({ groupId: 0, projectId: Number(value) })
          }
        >
          {projects.map(({ id, title }) => (
            <MenuItem key={id} value={id}>
              {title}
            </MenuItem>
          ))}
        </Select>
        <Select
          value={currentGroup.id}
          onChange={({ target: { value } }): void =>
            setSelections({ ...selections, groupId: Number(value) })
          }
        >
          {groups.length ? (
            groups.map(({ id, title }) => (
              <MenuItem key={id} value={id}>
                {title}
              </MenuItem>
            ))
          ) : (
            <MenuItem value={0}>No groups</MenuItem>
          )}
        </Select>
        <Typography variant="body2">
          {parseAndFormatSQLDateInterval(currentProject)}
        </Typography>
        {currentGroup.pending && (
          <>
            <p>This group is pending and cannot make reservations.</p>
            {currentGroup.exceptionalSize && (
              <p>There is an exceptional size request.</p>
            )}
            {currentGroup.members.map(
              ({ id, username, name, invitation: { accepted, rejected } }) => (
                <p key={`${currentGroup.id}-${username}-info`}>
                  {username} {User.formatName(name)} has{" "}
                  {currentGroup.creatorId === id
                    ? "created"
                    : rejected
                    ? "rejected"
                    : accepted
                    ? "accepted"
                    : "not answered"}{" "}
                  the invitation.
                </p>
              )
            )}
          </>
        )}
        <Accordion defaultExpanded>
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
                events={groupEvents}
                canceledEvents={[]}
                colors={colors}
              />
            </AccordionDetails>
          ))}
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body1">Group Info</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <ProjectDashboardGroup
              currentProject={currentProject}
              currentGroup={currentGroup}
            />
          </AccordionDetails>
        </Accordion>
        <Typography>Upcoming Sessions</Typography>
        {groupEvents.slice(0, splitPoint).map((event) => (
          <SessionInfo key={`group_event_listing_${event.id}`} event={event} />
        ))}
        <Typography>Previous Sessions</Typography>
        {groupEvents.slice(splitPoint).map((event) => (
          <SessionInfo key={`group_event_listing_${event.id}`} event={event} />
        ))}
      </Paper>
    </Dialog>
  );
};

export default ProjectDashboard;
