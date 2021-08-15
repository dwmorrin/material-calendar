import React, { FC } from "react";
import { Button, ListItem } from "@material-ui/core";
import { Action, CalendarAction } from "../../calendar/types";
import User from "../../resources/User";
import UserGroup from "../../resources/UserGroup";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { Mail } from "../../utils/mail";
import Invitation, {
  invitationIsUnanswered,
  invitationIsPendingApproval,
} from "../../resources/Invitation";
import { InvitationItemProps } from "./types";
import { ResourceKey } from "../../resources/types";

interface InvitationUpdateProps {
  invitation: Invitation;
  userId: number;
  mail: Mail;
  dispatch: (a: Action) => void;
  accepted: boolean;
}

const updateInvitation = ({
  accepted,
  userId,
  mail,
  dispatch,
}: InvitationUpdateProps): void => {
  const body: Record<string, unknown> = { userId, mail };
  if (accepted) body.accepted = 1;
  else body.rejected = 1;
  // todo: switch to UserGroup url
  fetch(`${Invitation.url}/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then(({ error, data }) => {
      if (error) throw error;
      if (!data) throw new Error("No updated group info returned");
      const { invitations, groups, currentGroup } = data;
      if (!Array.isArray(invitations))
        throw new Error("No updated invitations info returned");
      if (!Array.isArray(groups))
        throw new Error("No updated group info returned");
      if (!currentGroup) throw new Error("No updated group info returned");
      dispatch({
        type: accepted
          ? CalendarAction.JoinedGroup
          : CalendarAction.RejectedGroupInvitation,
        payload: {
          currentGroup,
          invitations: invitations.map((i) => new Invitation(i)),
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
  invitation,
  project,
  user,
}) => {
  const onAcceptInvitation = (): void => {
    const name = User.formatName(user.name);
    const mail: Mail = {
      to: "TODO - FIX THIS", // TODO
      subject: `${name} has joined your group`,
      text: `${name} has joined your group for ${project.title}`,
    };
    updateInvitation({
      accepted: true,
      invitation,
      userId: user.id,
      mail,
      dispatch,
    });
  };

  const onDeclineInvitation = (): void => {
    const name = User.formatName(user.name);
    const mail: Mail = {
      to: "TODO - FIX THIS",
      subject: `${name} has declined your invitation`,
      text: `${name} has declined your invitation for ${project.title}`,
    };
    updateInvitation({
      accepted: false,
      invitation,
      userId: user.id,
      mail,
      dispatch,
    });
  };

  const isNotCurrentUser = ({ id }: { id: number }): boolean => id !== user.id;
  const others = invitation.invitees
    .filter(isNotCurrentUser)
    .map(({ name }) => User.formatName(name))
    .join(", ");
  const invitorName = "NAME"; // TODO User.formatName(invitation.invitor.name);
  const andUser = invitation.invitees.some(isNotCurrentUser);
  const header = [
    invitorName,
    " wants to form a group with ",
    others,
    andUser ? ", and " : "",
    "you",
  ].join("");

  return (
    <ListItem style={{ justifyContent: "space-between" }}>
      {header}
      {invitationIsUnanswered(invitation, user) && (
        <ButtonGroup variant="contained" color="primary" size="small">
          <Button
            style={{ backgroundColor: "Green", color: "white" }}
            onClick={onAcceptInvitation}
          >
            Accept Invitation
          </Button>
          <Button
            style={{ backgroundColor: "Red", color: "white" }}
            onClick={onDeclineInvitation}
          >
            Decline Invitation
          </Button>
        </ButtonGroup>
      )}
      {!invitationIsUnanswered(invitation, user) &&
        invitationIsPendingApproval && (
          <b>Invitation is pending admin approval</b>
        )}
    </ListItem>
  );
};

export default InvitationInboxItem;
