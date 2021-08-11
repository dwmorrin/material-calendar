import React, { FC } from "react";
import { Button, Box } from "@material-ui/core";
import { CalendarAction } from "../../calendar/types";
import UserGroup from "../../resources/UserGroup";
import Invitation from "../../resources/Invitation";
import { GroupInfoProps } from "./types";
import { Mail, groupTo } from "../../utils/mail";
import { ResourceKey } from "../../resources/types";

const groupBox: FC<GroupInfoProps> = ({ dispatch, group, project, user }) => {
  const onLeave = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    // TODO add a comment as to why we need to stop the event propagation
    event.stopPropagation();
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
        const { invitations, groups } = data;
        if (!Array.isArray(groups))
          throw new Error("no updated groups received");
        if (!Array.isArray(invitations))
          throw new Error("no updated invitations received");
        dispatch({
          type: CalendarAction.LeftGroup,
          payload: {
            resources: {
              [ResourceKey.Groups]: groups.map((g) => new UserGroup(g)),
            },
            invitations: invitations.map((i) => new Invitation(i)),
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
