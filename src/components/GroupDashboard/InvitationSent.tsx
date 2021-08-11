import React, { FC } from "react";
import { Button, ListItem } from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../../calendar/types";
import User from "../../resources/User";
import Project from "../../resources/Project";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbsUpDownIcon from "@material-ui/icons/ThumbsUpDown";
import { sendMail } from "../../utils/mail";
import Invitation from "../../resources/Invitation";

const InvitationSent: FC<
  Omit<CalendarUIProps, "state"> & {
    currentProject: Project;
    invitation: Invitation;
    user: User;
  }
> = ({ dispatch, currentProject, invitation, user }) => {
  // TODO put this in the invitation class
  const invitationIsPendingApproval = (invitation: Invitation): boolean => {
    return !invitation.approvedId && !invitation.deniedId;
  };

  const dispatchError = (error: Error): void =>
    dispatch({ type: CalendarAction.Error, payload: { error } });

  return (
    <ListItem style={{ justifyContent: "space-between" }}>
      {invitation.invitees.length == 0
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
        {invitation.invitees.map((invitee) => (
          <ListItem key={`invitation-${invitation.id}-invitee-${invitee.id}`}>
            {invitee.name.first + " " + invitee.name.last + "  "}
            {invitee.accepted ? (
              <ThumbUpIcon />
            ) : invitee.rejected ? (
              <ThumbDownIcon />
            ) : (
              <ThumbsUpDownIcon />
            )}
          </ListItem>
        ))}
        <Button
          style={{ backgroundColor: "Red", color: "white" }}
          onClick={(event): void => {
            event.stopPropagation();
            // Delete invitation which will delete
            // entries on invitee table via CASCADE
            fetch(`${Invitation.url}/${invitation.id}`, {
              method: "DELETE",
              headers: {},
              body: null,
            })
              .then((response) => response.json())
              .then(({ error }) => {
                if (error) throw error;
                invitation.invitees.forEach((u) => {
                  if (!u.email)
                    throw new Error(
                      `${u.name.first} ${u.name.last} has no email`
                    );
                  sendMail(
                    u.email,
                    user.name.first +
                      " " +
                      user.name.last +
                      " has canceled the group invitation",
                    "Hello " +
                      u.name?.first +
                      ", " +
                      user.name.first +
                      " " +
                      user.name.last +
                      " has canceled the group invitation" +
                      " they sent to you for " +
                      currentProject.title,
                    dispatchError
                  );
                });
                //Get updated invitations
                fetch(`${Invitation.url}/user/${user?.id}`)
                  .then((response) => response.json())
                  .then(({ error, data }) => {
                    if (error) throw error;
                    if (!data) throw new Error("no invitations received");
                    dispatch({
                      type: CalendarAction.ReceivedInvitations,
                      payload: {
                        invitations: data,
                      },
                    });
                  });
                dispatch({
                  type: CalendarAction.DisplayMessage,
                  payload: {
                    message: "Invitation Canceled",
                  },
                });
              })
              .catch(dispatchError);
          }}
        >
          Cancel Invitation
        </Button>
      </section>
    </ListItem>
  );
};

export default InvitationSent;
