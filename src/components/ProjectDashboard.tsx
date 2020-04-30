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
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { AuthContext } from "./AuthContext";
import { makeTransition } from "./Transition";
import { getFormattedEventInterval } from "../calendar/date";
import { ProjectLocationAllotment } from "../calendar/Project";
import ProjectLocationHours from "./ProjectLocationHours";
import { fetchCalendarData } from "../calendar/Fetch";
import ProjectDashboardGroup from "./ProjectDashboardGroup";

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
// ! pick one
// const initialAllotments: ProjectLocationAllotment[][] = [];
const initialAllotments: { [k: number]: ProjectLocationAllotment[] } = {};

const ProjectDashboard: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [allotments, setAllotments] = useState(initialAllotments);
  const { currentProject } = state;
  const locations = state.locations.filter((location) =>
    currentProject?.locationIds.includes(location.id)
  );

  useEffect(() => {
    if (!currentProject) {
      return;
    }
    fetchCalendarData({
      dispatch,
      onSuccessAction: CalendarAction.ReceivedGroups,
      payloadKey: "currentProjectGroups",
      url: `/api/project_groups/${currentProject.id}`,
    });
  }, [currentProject, dispatch, user]);

  useEffect(() => {
    if (!currentProject) {
      return;
    }
    // ! this Promise.all doesn't cause the D3 stuff to render...
    // const requests = currentProject.childrenIds.map((id) =>
    //   fetch(`/api/project_location_allotment/${id}`)
    // );
    // Promise.all(requests).then((responses) => {
    //   Promise.all(responses.map((res) => res.json()))
    //     .then((locations) => {
    //       console.log("setAllotments", { locations });
    //       setAllotments(locations);
    //     })
    //     .catch(console.error);
    // });
    // ! this has bug where 2nd visit to D3 stuff, only first shows...
    currentProject.childrenIds.forEach((id) => {
      fetch(`/api/project_location_allotment/${id}`)
        .then((response) => response.json())
        .then((data) => {
          data.forEach((d: ProjectLocationAllotment) => {
            d.start = new Date(d.start);
            d.end = new Date(d.end);
          });
          setAllotments({
            ...allotments,
            [data[0].locationId]: data,
          });
        })
        .catch(console.error);
    });
  }, [currentProject]);

  // console.log({ allotments });
  return (
    <Dialog
      className={classes.root}
      fullScreen
      open={state.projectDashboardIsOpen}
      TransitionComponent={transition}
    >
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
                // ! pick one data depending on above choices
                // data={allotments.find((a) => a[0].locationId === location.id)}
                data={allotments[+location.id]}
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
        <Typography>Previous Sessions</Typography>
      </Paper>
    </Dialog>
  );
};

export default ProjectDashboard;
