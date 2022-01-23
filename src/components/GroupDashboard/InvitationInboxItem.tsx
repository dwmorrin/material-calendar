import React, { FC } from "react";
import { Button, List, ListItem } from "@material-ui/core";
import { Action, CalendarAction } from "../types";
import User from "../../resources/User";
import UserGroup from "../../resources/UserGroup";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { groupTo, Mail } from "../../utils/mail";
import { InvitationItemProps } from "./types";
import { ResourceKey } from "../../resources/types";
import InvitationMember from "./InvitationMember";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";

interface InvitationUpdateProps {
  pendingGroup: UserGroup;
  mail: Mail;
  dispatch: (a: Action) => void;
  accepted: boolean;
  projectId: number;
  setProjectMembers: (u: User[]) => void;
}

const updateInvitation = ({
  accepted,
  dispatch,
  mail,
  pendingGroup,
  projectId,
  setProjectMembers,
}: InvitationUpdateProps): void => {
  const body: {
    accepted?: boolean;
    rejected?: boolean;
    mail: Mail;
    projectId: number;
  } = { mail, projectId };
  if (accepted) body.accepted = true;
  else body.rejected = true;
  fetch(UserGroup.invitationUrls.update(pendingGroup), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then(({ error, data }) => {
      if (error) throw error;
      if (!data) throw new Error("No updated group info returned");
      const groups: UserGroup[] = data.groups;
      const members: User[] = data.members;
      if (!Array.isArray(groups))
        throw new Error("No updated group info returned");
      if (!Array.isArray(members))
        throw new Error("No updated project member info returned");
      setProjectMembers(members.map((m) => new User(m)));
      // OK if currentGroup is undefined as rejecting invite destroys group
      const currentGroup = groups.find(({ id }) => id === pendingGroup.id);
      dispatch({
        type: accepted
          ? CalendarAction.JoinedGroup
          : CalendarAction.RejectedGroupInvitation,
        payload: {
          currentGroup,
          resources: {
            [ResourceKey.Groups]: groups.map((g) => new UserGroup(g)),
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
  setProjectMembers,
}) => {
  const onAcceptInvitation = (accepted: boolean): void => {
    const name = User.formatName(user.name);
    const subject = `${name} has ${
      accepted ? "joined" : "declined"
    } your group invitation`;
    const mail: Mail = {
      to: groupTo(pendingGroup.members),
      subject,
      text: `${subject} for ${project.title}`,
    };
    updateInvitation({
      accepted,
      pendingGroup,
      mail,
      dispatch,
      projectId: project.id,
      setProjectMembers,
    });
  };

  const myself = pendingGroup.members.find(({ id }) => id === user.id);
  if (!myself) throw new Error("can't find you in your own group");
  const unanswered = !myself.invitation.accepted && !myself.invitation.rejected;
  return (
    <ListItem>
      {(Boolean(pendingGroup.exceptionalSize) || unanswered) && (
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
          {unanswered && (
            <ButtonGroup variant="contained" color="primary">
              <Button
                color="primary"
                onClick={(): void => onAcceptInvitation(true)}
                startIcon={<ThumbUpIcon />}
              >
                Accept Invitation
              </Button>
              <Button
                color="secondary"
                onClick={(): void => onAcceptInvitation(false)}
                endIcon={<ThumbDownIcon />}
              >
                Decline Invitation
              </Button>
            </ButtonGroup>
          )}
          {Boolean(pendingGroup.exceptionalSize) && (
            <b>Group is an exceptional size and requires admin approval.</b>
          )}
        </List>
      )}
    </ListItem>
  );
};

export default InvitationInboxItem;
