import React, { FC } from "react";
import { Button, Box } from "@material-ui/core";
import { CalendarAction } from "../../calendar/types";
import User from "../../resources/User";
import UserGroup from "../../resources/UserGroup";
import { GroupInfoProps } from "./types";
import { Mail, groupTo } from "../../utils/mail";
import { ResourceKey } from "../../resources/types";

const groupBox: FC<GroupInfoProps> = ({
  dispatch,
  group,
  project,
  user,
  setProjectMembers,
}) => {
  const onLeave = (): void => {
    const name = [user.name.first, user.name.last].filter(String).join(" ");
    const mail: Mail = {
      to: groupTo(group.members),
      subject: `${name} has left the group`,
      text: `${name} has left the group for ${project.title}`,
    };
    // remove user from group
    fetch(`${UserGroup.url}/${group.id}/user/${user.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mail,
        projectId: project.id,
        groupIsEmpty: group.members.length === 1,
      }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        const groups: UserGroup[] = data.groups;
        const members: User[] = data.members;
        if (!Array.isArray(groups))
          throw new Error("no updated groups received");
        if (!Array.isArray(groups))
          throw new Error("no updated project members received");
        setProjectMembers(members.map((m) => new User(m)));
        dispatch({
          type: CalendarAction.LeftGroup,
          payload: {
            resources: {
              [ResourceKey.Groups]: groups.map((g) => new UserGroup(g)),
            },
          },
        });
      })
      .catch((error) =>
        dispatch({ type: CalendarAction.Error, payload: { error } })
      );
  };

  return (
    <Box
      style={{
        padding: "8px 16px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {group.title}
      <Button
        size="small"
        variant="contained"
        color="inherit"
        onClick={onLeave}
      >
        Leave Group
      </Button>
    </Box>
  );
};

export default groupBox;
