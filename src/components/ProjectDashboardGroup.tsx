import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  Typography,
  Avatar,
  Button,
  LinearProgress,
  Badge,
} from "@material-ui/core";
import { ResourceKey } from "../resources/types";
import UserGroup from "../resources/UserGroup";
import { useAuth } from "./AuthProvider";
import { getUnansweredInvitations } from "../resources/Invitation";

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

  const { user } = useAuth();
  if (!currentProject || isNaN(currentProject.groupAllottedHours)) return null;

  const unansweredInvitations = getUnansweredInvitations(
    user,
    state.invitations
  );

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
    </section>
  );
};

export default ProjectDashboardGroup;
