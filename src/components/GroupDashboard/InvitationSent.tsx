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
import UserGroup from "../../resources/UserGroup";
import { ResourceKey } from "../../resources/types";

const InvitationSent: FC<InvitationItemProps> = ({
  dispatch,
  project,
  pendingGroup: invitation,
  user,
}) => {
  const onCancelInvitation = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    // TODO add comment as to why the stop propagation is needed
    event.stopPropagation();
    const name = User.formatName(user.name);
    const mail: Mail = {
      to: groupTo(invitation.members),
      subject: `${name} has canceled the group invitation`,
      text: `${name} has canceled the group invitation they sent you for ${project.title}.`,
    };
    fetch(`${UserGroup.url}`, {
      //!todo fix url: probably :id/invitations/reject or something
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mail }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        const invitations: Invitation[] = data.invitations;
        const groups: UserGroup[] = data.groups;
        if (!Array.isArray(invitations))
          throw new Error("no invitations received");
        if (!Array.isArray(groups)) throw new Error("no groups received");
        dispatch({
          type: CalendarAction.CanceledInvitationReceived,
          payload: {
            resources: {
              [ResourceKey.Groups]: groups.map((g) => new UserGroup(g)),
            },
            invitations: invitations.map((i) => new Invitation(i)),
          },
        });
      })
      .catch((error): void =>
        dispatch({ type: CalendarAction.Error, payload: { error } })
      );
  };

  return (
    <ListItem style={{ justifyContent: "space-between" }}>
      {!invitation.members.length
        ? "You requested to group by self"
        : "You sent a Group Invitation"}

      {
        /* TODO just temporarily using `pending` here */ invitation.pending && (
          <b>
            <br />
            <br />
            Pending Admin Approval
          </b>
        )
      }
      <section
        style={{
          textAlign: "center",
          flexDirection: "column",
          justifyContent: "space-around",
        }}
      >
        {invitation.members.map(
          ({ id, name, invitation: { accepted, rejected } }, i) => (
            <ListItem key={`invitation-${i}-invitee-${id}`}>
              {User.formatName(name)}
              {accepted ? (
                <ThumbUpIcon />
              ) : rejected ? (
                <ThumbDownIcon />
              ) : (
                <ThumbsUpDownIcon />
              )}
            </ListItem>
          )
        )}
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
