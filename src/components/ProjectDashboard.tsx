import React, {
  FunctionComponent,
  useEffect,
  useContext,
  useState,
} from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  IconButton,
  Grid,
  Paper,
  makeStyles,
  Dialog,
  Toolbar,
  Typography,
  Button,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Select from "./Select";
import ProgressBar from "./ProgressBar";
import { AuthContext } from "./AuthContext";
import { makeTransition } from "./Transition";
import UserGroup from "../user/UserGroup";

const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "white",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
  },
  grid: {
    textAlign: "center",
  },
  text: {
    paddingLeft: "10px",
    textAlign: "left",
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
  let { currentProject } = state;

  useEffect(() => {
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

  const classes = useStyles();
  return (
    <Dialog
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
        <Typography>Projects</Typography>
      </Toolbar>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                Studio Allotment
              </Grid>
              <Grid item xs={5}></Grid>
              <Grid item xs={12}>
                <ProgressBar
                  left={{ title: "", value: 9, color: "#fc0303" }}
                  right={{ title: "", value: 3, color: "#03fc1c" }}
                />{" "}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} className={classes.grid}>
          <Paper className={classes.paper}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <b>My Group</b>
              </Grid>
              {/* <Grid item xs={5}>
                <p className={classes.text}>
                  {" "}
                  Group Members:
                  <br />
                  {group.length < 1 ? undefined : (
                    <Button
                      size="small"
                      variant="contained"
                      color="inherit"
                      disableElevation
                    >
                      Leave Group
                    </Button>
                  )}
                </p>
              </Grid> */}
              <Grid item xs={7}>
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
                    Add User
                  </Button>
                </p>
              </Grid>
              <Grid item xs={12}>
                <p className={classes.text}>My Hours:</p>
              </Grid>
              <Grid item xs={12}>
                <ProgressBar
                  left={{ title: "", value: 12, color: "#fc0303" }}
                  right={{ title: "", value: 3, color: "#03fc1c" }}
                />
              </Grid>
              <Grid item xs={12}>
                <p className={classes.text}>Upcoming Sessions:</p>
              </Grid>
              <Grid item xs={12}>
                <p className={classes.text}>Previous Sessions:</p>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Dialog>
  );
};

export default ProjectDashboard;
