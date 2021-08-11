import React, { FC } from "react";
import { Button, Box } from "@material-ui/core";
import { CalendarAction } from "../../calendar/types";
import UserGroup from "../../resources/UserGroup";
import Invitation from "../../resources/Invitation";
import { GroupInfoProps } from "./types";

const CurrentGroupBox: FC<GroupInfoProps> = ({
  dispatch,
  currentGroup,
  user,
  invitations,
}) => (
  <Box
    style={{
      padding: "8px 16px",
      display: "flex",
      justifyContent: "space-between",
    }}
  >
    {currentGroup.title}
    <Button
      size="small"
      variant="contained"
      color="inherit"
      onClick={(event): void => {
        event.stopPropagation();
        // remove user from group
        fetch(`${UserGroup.url}/${currentGroup.id}/user/${user.id}`, {
          method: "DELETE",
          headers: {},
          body: null,
        })
          .then((response) => response.json())
          .then(({ error }) => {
            if (error) throw error;
            const invitation = invitations.find(
              (invitation) => invitation.groupId === currentGroup.id
            );
            //Mark group Invitation Rejected so it doesn't show up again
            if (invitation) {
              fetch(`${Invitation.url}/${invitation.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  rejected: 1,
                  userId: user.id,
                }),
              })
                .then((response) => response.json())
                .then(({ error }) => {
                  if (error) throw error;
                })
                .catch((error) =>
                  dispatch({ type: CalendarAction.Error, payload: { error } })
                );
            }
            //If user was the last member of the group, delete the group
            if (currentGroup.members.length <= 1) {
              fetch(`${UserGroup.url}/${currentGroup.id}`, {
                method: "DELETE",
                headers: {},
                body: null,
              })
                .then((response) => response.json())
                .then(({ error }) => {
                  if (error) throw error;
                })
                .catch((error) =>
                  dispatch({ type: CalendarAction.Error, payload: { error } })
                );
            } else {
              currentGroup.members.forEach((u) => {
                if (!u.email)
                  throw new Error(
                    `${u.name.first} ${u.name.last} has no email`
                  );
                // TODO send email in previous fetch
                // sendMail(
                //   u.email,
                //   user.name.first +
                //     " " +
                //     user.name.last +
                //     " has left the group",
                //   "Hello " +
                //     u.name?.first +
                //     ", " +
                //     user.name.first +
                //     " " +
                //     user.name.last +
                //     " has left your group for " +
                //     currentProject?.title,
                //   dispatchError
                // );
              });
            }
            dispatch({ type: CalendarAction.LeftGroup });
          })
          .catch((error) =>
            dispatch({ type: CalendarAction.Error, payload: { error } })
          );
      }}
    >
      Leave Group
    </Button>
  </Box>
);

export default CurrentGroupBox;
