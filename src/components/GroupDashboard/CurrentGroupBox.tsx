import React, { FC } from "react";
import { Button, Box } from "@material-ui/core";
import { CalendarAction } from "../../calendar/types";
import UserGroup from "../../resources/UserGroup";
import { GroupInfoProps } from "./types";
import { Mail } from "../../utils/mail";

const groupBox: FC<GroupInfoProps> = ({ dispatch, group, project, user }) => {
  const onLeave = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    event.stopPropagation();
    const name = [user.name.first, user.name.last].filter(String).join(" ");
    const mail: Mail = {
      to: group.members
        .map(({ email }) => email)
        .filter(String)
        .join(),
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
      .then(({ error }) => {
        if (error) throw error;
        //! TODO we need to update groups and invitations
        dispatch({ type: CalendarAction.LeftGroup });
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
