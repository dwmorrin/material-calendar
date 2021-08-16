import React, { FC } from "react";
import { Button, List, ListItem } from "@material-ui/core";
import { CalendarAction } from "../../calendar/types";
import { Mail, groupTo } from "../../utils/mail";
import { InvitationItemProps } from "./types";
import User from "../../resources/User";
import UserGroup from "../../resources/UserGroup";
import { ResourceKey } from "../../resources/types";
import InvitationMember from "./InvitationMember";

const InvitationSent: FC<InvitationItemProps> = ({
  dispatch,
  project,
  pendingGroup,
  user,
}) => {
  const onCancelInvitation = (): void => {
    const name = User.formatName(user.name);
    const mail: Mail = {
      to: groupTo(pendingGroup.members),
      subject: `${name} has canceled the group invitation`,
      text: `${name} has canceled the group invitation they sent you for ${project.title}.`,
    };
    fetch(UserGroup.invitationUrls.cancel(pendingGroup), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mail }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        const groups: UserGroup[] = data.groups;
        if (!Array.isArray(groups))
          throw new Error("no updated groups received");
        dispatch({
          type: CalendarAction.CanceledInvitationReceived,
          payload: {
            resources: {
              [ResourceKey.Groups]: groups.map((g) => new UserGroup(g)),
            },
          },
        });
      })
      .catch((error): void =>
        dispatch({ type: CalendarAction.Error, payload: { error } })
      );
  };

  return (
    <ListItem>
      {pendingGroup.pending && pendingGroup.exceptionalSize && (
        <>Exceptional size: waiting on admin approval</>
      )}
      <List>
        {pendingGroup.members.map(
          ({ id, name, invitation: { accepted, rejected } }, i) => (
            <InvitationMember
              key={`invitation-${i}-invitee-${id}`}
              name={name}
              accepted={accepted}
              rejected={rejected}
            />
          )
        )}
        <ListItem>
          <Button
            variant="contained"
            color="secondary"
            onClick={onCancelInvitation}
          >
            Cancel Invitation
          </Button>
        </ListItem>
      </List>
    </ListItem>
  );
};

export default InvitationSent;
