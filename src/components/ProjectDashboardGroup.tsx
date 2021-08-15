import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  Avatar,
  Badge,
  Button,
  Grid,
  LinearProgress,
  Typography,
} from "@material-ui/core";
import { ResourceKey } from "../resources/types";
import UserGroup from "../resources/UserGroup";
import { useAuth } from "./AuthProvider";
import { getUnansweredInvitations } from "../resources/Invitation";
import { makeStyles } from "@material-ui/core/styles";
import { deepPurple } from "@material-ui/core/colors";

const useStyles = makeStyles((theme) => ({
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
}));

const availableHoursAsPercent = (maximum: number, used: number): number =>
  (100 * (maximum - used)) / maximum;

const ProjectDashboardGroup: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const classes = useStyles();
  const { currentProject, resources } = state;
  const currentGroup =
    (resources[ResourceKey.Groups] as UserGroup[]).find(
      (g) => g.projectId === currentProject?.id
    ) || new UserGroup();

  const { user } = useAuth();
  if (!currentProject || isNaN(currentProject.groupAllottedHours)) return null;

  const unansweredInvitations = getUnansweredInvitations(
    user,
    state.invitations
  );

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item>
        <Typography variant="body2">Group Hours</Typography>
        <LinearProgress
          style={{ height: 10 }}
          variant="determinate"
          value={availableHoursAsPercent(
            currentProject.groupAllottedHours,
            currentGroup.reservedHours
          )}
        />
        Reserved {currentGroup.reservedHours} hours of{" "}
        {currentProject.groupAllottedHours} hours available
      </Grid>
      <Grid item>
        <Typography variant="body2">Members</Typography>
        <Grid container direction="row">
          {currentGroup.members.map(({ name }, index) => (
            <Avatar key={`avatar_${index}`} className={classes.purple}>
              {`${name.first ? name.first[0] : "_"} ${
                name.last ? name.last[0] : "_"
              }`}
            </Avatar>
          ))}
        </Grid>
        <Badge
          color="secondary"
          badgeContent={
            unansweredInvitations.filter(
              ({ projectId }) => projectId === currentProject.id
            ).length
          }
        >
          <Button
            size="small"
            variant="contained"
            color="inherit"
            onClick={(): void =>
              dispatch({ type: CalendarAction.OpenGroupDashboard })
            }
          >
            Manage group
          </Button>
        </Badge>
      </Grid>
    </Grid>
  );
};

export default ProjectDashboardGroup;
