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
  Button,
  LinearProgress,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ProgressBar from "./ProgressBar";
import { AuthContext } from "./AuthContext";
import { makeTransition } from "./Transition";
import UserGroup from "../user/UserGroup";

const useStyles = makeStyles((theme) => ({
  // formControl: {
  //   margin: theme.spacing(1),
  //   minWidth: 120,
  // },
  root: {
    flexGrow: 1,
  },
  // menuButton: {
  //   marginRight: theme.spacing(2),
  // },
  // title: {
  //   flexGrow: 1,
  //   color: "white",
  // },
  // paper: {
  //   padding: theme.spacing(2),
  //   textAlign: "center",
  // },
  // grid: {
  //   textAlign: "center",
  // },
  text: {
    // paddingLeft: "10px",
    // textAlign: "left",
  },
  hoursBar: {
    margin: theme.spacing(1),
    height: 10,
  },
}));

const transition = makeTransition("right");
const initialGroups: UserGroup[] = [];

const ProjectDashboard: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState(initialGroups);
  const { currentProject } = state;
  const classes = useStyles();

  useEffect(() => {
    if (!currentProject?.id) {
      return;
    }
    fetch(`/api/project_groups/${currentProject?.id}`)
      .then((response) => response.json())
      .then((groups) => {
        const usergroups = groups.map(
          (group: UserGroup) => new UserGroup(group)
        );
        setGroups(usergroups);
      })
      .catch(console.error);
  }, [currentProject, user]);

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
      <Typography>
        {
          state.locations.find(
            (location) => location.id === currentProject?.locationId
          )?.title
        }
      </Typography>
      <Typography>My Group</Typography>
      <p className={classes.text}>
        {groups
          .filter((group) => user?.groupIds.includes(group.id))
          .map((group) => {
            return (
              <span key={group.id}>
                {group.title}
                <br />
              </span>
            );
          })}
        <Button
          size="small"
          variant="contained"
          color="inherit"
          disableElevation
        >
          Manage group
        </Button>
      </p>
      <Typography>My Hours</Typography>
      <LinearProgress
        className={classes.hoursBar}
        variant="determinate"
        value={20}
      />
      <Typography>Upcoming Sessions</Typography>
      <Typography>Previous Sessions</Typography>
    </Dialog>
  );
};

export default ProjectDashboard;
