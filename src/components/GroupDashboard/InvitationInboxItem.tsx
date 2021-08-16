import React, { FC } from "react";
import { Button, List, ListItem } from "@material-ui/core";
import { Action, CalendarAction } from "../../calendar/types";
import User from "../../resources/User";
import UserGroup from "../../resources/UserGroup";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { groupTo, Mail } from "../../utils/mail";
import { InvitationItemProps } from "./types";
import { ResourceKey } from "../../resources/types";
import InvitationMember from "./InvitationMember";

interface InvitationUpdateProps {
  pendingGroup: UserGroup;
  userId: number;
  mail: Mail;
  dispatch: (a: Action) => void;
  accepted: boolean;
}

const updateInvitation = ({
  accepted,
  dispatch,
  mail,
  pendingGroup,
  userId,
}: InvitationUpdateProps): void => {
  const body: Record<string, unknown> = { userId, mail };
  if (accepted) body.accepted = 1;
  else body.rejected = 1;
  fetch(`${UserGroup.url}/${pendingGroup.id}/invite`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then(({ error, data }) => {
      if (error) throw error;
      if (!data) throw new Error("No updated group info returned");
      const { groups, currentGroup } = data;
      // if (!Array.isArray(invitations))
      //   throw new Error("No updated invitations info returned");
      if (!Array.isArray(groups))
        throw new Error("No updated group info returned");
      if (!currentGroup) throw new Error("No updated group info returned");
      dispatch({
        type: accepted
          ? CalendarAction.JoinedGroup
          : CalendarAction.RejectedGroupInvitation,
        payload: {
          currentGroup,
          // invitations: invitations.map((i) => new Invitation(i)),
          resources: {
            [ResourceKey.Groups]: (groups as UserGroup[]).map(
              (g) => new UserGroup(g)
            ),
          },
        },
      });
    })
    .catch((error) => dispatch({ type: CalendarAction.Error, payload: error }));
};

const InvitationInboxItem: FC<InvitationItemProps> = ({
  dispatch,
  pendingGroup,
  project,
  user,
}) => {
  const onAcceptInvitation = (): void => {
    const name = User.formatName(user.name);
    const mail: Mail = {
      to: groupTo(pendingGroup.members),
      subject: `${name} has joined your group`,
      text: `${name} has joined your group for ${project.title}`,
    };
    updateInvitation({
      accepted: true,
      pendingGroup,
      userId: user.id,
      mail,
      dispatch,
    });
  };

  const onDeclineInvitation = (): void => {
    const name = User.formatName(user.name);
    const mail: Mail = {
      to: groupTo(pendingGroup.members),
      subject: `${name} has declined your invitation`,
      text: `${name} has declined your invitation for ${project.title}`,
    };
    updateInvitation({
      accepted: false,
      pendingGroup,
      userId: user.id,
      mail,
      dispatch,
    });
  };

  const myself = pendingGroup.members.find(({ id }) => id === user.id);
  if (!myself) throw new Error("can't find you in your own group");
  const unanswered = !myself.invitation.accepted && !myself.invitation.rejected;

  return (
    <ListItem>
      {unanswered && (
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
          <ButtonGroup variant="contained" color="primary" size="small">
            <Button color="primary" onClick={onAcceptInvitation}>
              Accept Invitation
            </Button>
            <Button color="secondary" onClick={onDeclineInvitation}>
              Decline Invitation
            </Button>
          </ButtonGroup>
        </List>
      )}
      {!unanswered && pendingGroup.exceptionalSize && (
        <b>Group is an exceptional size and requires admin approval.</b>
      )}
    </ListItem>
  );
};

export default InvitationInboxItem;
