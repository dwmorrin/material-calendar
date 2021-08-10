import React, { FunctionComponent } from "react";
import { Typography, Grid, LinearProgress } from "@material-ui/core";
import Project from "../../resources/Project";
import UserGroup from "../../resources/UserGroup";

const availableHoursAsPercent = (maximum: number, used: number): number =>
  (100 * (maximum - used)) / maximum;

const ProjectDashboardGroup: FunctionComponent<{
  currentProject: Project;
  currentGroup: UserGroup;
}> = ({ currentGroup, currentProject }) => {
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
        <Grid container direction="column" spacing={2}>
          {currentGroup.members.map(({ name, username }, index) => (
            <Grid item key={"group-member-" + index}>
              {username}: {name.first} {name.last}
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default ProjectDashboardGroup;
