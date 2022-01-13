import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../types";
import {
  Avatar,
  Badge,
  Button,
  Grid,
  LinearProgress,
  Typography,
} from "@material-ui/core";
import { ResourceKey } from "../../resources/types";
import UserGroup from "../../resources/UserGroup";
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
  const groups = resources[ResourceKey.Groups] as UserGroup[];
  // TODO double check this logic: are we filtering pending and abandonded projects?
  const currentGroup =
    groups.find((g) => g.projectId === currentProject?.id) || new UserGroup();

  const invitations = groups.filter(({ pending }) => pending);

  if (!currentProject || isNaN(currentProject.groupAllottedHours)) return null;

  const pluralCheck = (n: number): string => (n === 1 ? "" : "s");
  const pluralize = (n: number, word: string): string =>
    `${n} ${word}${pluralCheck(n)}`;

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
        <Typography variant="caption">
          Group max: {pluralize(currentProject.groupAllottedHours, "hour")}.
          Reserved: {pluralize(currentGroup.reservedHours, "hour")}. (
          {Math.trunc(
            (100 * currentGroup.reservedHours) /
              currentProject.groupAllottedHours
          )}
          % used)
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="body2">Members</Typography>
        <Grid container direction="row">
          {currentGroup.members.map(({ name }, index) => (
            <Avatar key={`avatar_${index}`} className={classes.purple}>
              {`${name.first ? name.first[0] : "_"}${
                name.last ? name.last[0] : "_"
              }`}
            </Avatar>
          ))}
        </Grid>
        <Badge
          color="secondary"
          badgeContent={
            invitations.filter(
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
