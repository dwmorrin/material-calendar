import React, {
  FunctionComponent,
  useEffect,
  useContext,
  useState,
  Fragment,
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
  Paper,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { AuthContext } from "./AuthContext";
import { makeTransition } from "./Transition";
import UserGroup from "../user/UserGroup";

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
const initialGroups: UserGroup[] = [];

const ProjectDashboard: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState(initialGroups);
  const { currentProject } = state;
  const locations = state.locations.filter((location) =>
    currentProject?.locationIds.includes(location.id)
  );
  const projectGroups = groups.filter((group) =>
    user?.groupIds.includes(group.id)
  );
  const group = projectGroups.find(
    (group) => group.projectId === currentProject?.id
  );

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
      <Paper
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <section>
          <Typography variant="h5">Locations</Typography>
          {locations.map((location) => (
            <Fragment key={location.title}>
              <Typography>{location.title}</Typography>
              <LinearProgress // TODO remove hardcoded mock
                className={classes.hoursBar}
                variant="determinate"
                value={40}
              />
            </Fragment>
          ))}
        </section>
        <section>
          <Typography variant="h5">Group</Typography>
          <Typography variant="h6">Hours</Typography>
          <LinearProgress // TODO remove hardcoded mock
            className={classes.hoursBar}
            variant="determinate"
            value={20}
          />
          <Typography variant="h6">Members</Typography>
          <Typography>{group?.title}</Typography>
          <Button size="small" variant="contained" color="inherit">
            Manage group
          </Button>
        </section>
        <Typography>Upcoming Sessions</Typography>
        <Typography>Previous Sessions</Typography>
      </Paper>
    </Dialog>
  );
};

export default ProjectDashboard;
