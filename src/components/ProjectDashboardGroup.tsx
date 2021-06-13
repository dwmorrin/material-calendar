import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { Typography, Avatar, Button, LinearProgress } from "@material-ui/core";
import { ResourceKey } from "../resources/types";
import UserGroup from "../resources/UserGroup";

const availableHoursAsPercent = (maximum: number, used: number): number =>
  (100 * (maximum - used)) / maximum;

const ProjectDashboardGroup: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { currentProject, resources } = state;
  const currentGroup =
    (resources[ResourceKey.Groups] as UserGroup[]).find(
      (g) => g.projectId === currentProject?.id
    ) || new UserGroup();

  if (!currentProject || isNaN(currentProject.groupAllottedHours)) return null;

  return (
    <section>
      <Typography variant="body2">Group Hours</Typography>
      <LinearProgress
        style={{ height: 10 }}
        variant="determinate"
        value={availableHoursAsPercent(
          currentProject.groupAllottedHours,
          currentGroup.reservedHours
        )}
      />
      <Typography variant="body2">Members</Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {currentGroup.members.map(({ name }, index) => (
          <Avatar
            key={`avatar_${index}`}
            style={{ backgroundColor: "purple", marginLeft: 10 }} // TODO no inline
          >
            {`${name.first} ${name.last}`}
          </Avatar>
        ))}
      </div>
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
    </section>
  );
};

export default ProjectDashboardGroup;
