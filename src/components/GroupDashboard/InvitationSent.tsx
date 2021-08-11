import React, { FC } from "react";
import { Button, ListItem } from "@material-ui/core";
import { CalendarAction } from "../../calendar/types";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbsUpDownIcon from "@material-ui/icons/ThumbsUpDown";
import { Mail, groupTo } from "../../utils/mail";
import Invitation, {
  invitationIsPendingApproval,
} from "../../resources/Invitation";
import { InvitationItemProps } from "./types";
import User from "../../resources/User";

const InvitationSent: FC<InvitationItemProps> = ({
  dispatch,
  project,
  invitation,
  user,
}) => {
  const onCancelInvitation = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    // TODO add comment as to why the stop propogation is needed
    event.stopPropagation();
    const name = User.formatName(user.name);
    const mail: Mail = {
      to: groupTo(invitation.invitees),
      subject: `${name} has canceled the group invitation`,
      text: `${name} has canceled the group invitation they sent you for ${project.title}.`,
    };
    // Delete invitation which will delete
    // entries on invitee table via CASCADE
    fetch(`${Invitation.url}/${invitation.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mail }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        if (!data) throw new Error("no invitations received");
        dispatch({
          type: CalendarAction.ReceivedInvitations,
          payload: {
            invitations: (data as Invitation[]).map((i) => new Invitation(i)),
          },
        });
      })
      .catch((error): void =>
        dispatch({ type: CalendarAction.Error, payload: { error } })
      );
  };

  return (
    <ListItem style={{ justifyContent: "space-between" }}>
      {!invitation.invitees.length
        ? "You requested to group by self"
        : "You sent a Group Invitation"}

      {invitationIsPendingApproval(invitation) && (
        <b>
          <br />
          <br />
          Pending Admin Approval
        </b>
      )}
      <section
        style={{
          textAlign: "center",
          flexDirection: "column",
          justifyContent: "space-around",
        }}
      >
        {invitation.invitees.map(({ id, name, accepted, rejected }) => (
          <ListItem key={`invitation-${invitation.id}-invitee-${id}`}>
            {User.formatName(name)}
            {accepted ? (
              <ThumbUpIcon />
            ) : rejected ? (
              <ThumbDownIcon />
            ) : (
              <ThumbsUpDownIcon />
            )}
          </ListItem>
        ))}
        <Button
          style={{ backgroundColor: "Red", color: "white" }}
          onClick={onCancelInvitation}
        >
          Cancel Invitation
        </Button>
      </section>
    </ListItem>
  );
};

export default InvitationSent;
