import React, { FC } from "react";
import { Button, ListItem } from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../../calendar/types";
import UserGroup, { GroupMember } from "../../resources/UserGroup";
import User from "../../resources/User";
import Project from "../../resources/Project";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { sendMail } from "../../utils/mail";
import Invitation, {
  invitationIsUnanswered,
  invitationIsPendingApproval,
} from "../../resources/Invitation";

const InvitationInboxItem: FC<
  Omit<CalendarUIProps, "state"> & {
    currentProject: Project;
    invitation: Invitation;
    user: User;
  }
> = ({ dispatch, invitation, currentProject, user }) => {
  const isNotCurrentUser = ({ id }: { id: number }): boolean => id !== user.id;
  const dispatchError = (error: Error): void =>
    dispatch({ type: CalendarAction.Error, payload: { error } });

  const onAcceptInvitation = (): void => {
    // Accept Invitation
    fetch(`${Invitation.url}/${invitation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accepted: 1,
        userId: user.id,
      }),
    })
      .then((response) => response.json())
      .then(({ error }) => {
        if (error) throw error;
        if (!invitation.approvedId) {
          fetch(`${Invitation.url}/user/${user?.id}`)
            .then((response) => response.json())
            .then(({ error, data }) => {
              if (error) throw error;
              if (!data) throw new Error("No invitations received");
              dispatch({
                type: CalendarAction.ReceivedInvitations,
                payload: {
                  invitations: data,
                },
              });
            })
            .catch(dispatchError);
          return;
        }
        // If the group already exists, add user to it, otherwise form group with invitor and user
        invitation.groupId
          ? // Join Group
            fetch(
              `${UserGroup.url}/${invitation.groupId}/invitation/${invitation.id}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: "",
              }
            )
              .then((response) => response.json())
              .then(({ error }) => {
                if (error) throw error;
                // Get new group info and set state.currentGroup to it
                fetch(`${UserGroup.url}/${invitation.groupId}`)
                  .then((response) => response.json())
                  .then(({ error, data }) => {
                    if (error) throw error;
                    if (!data) throw new Error("no group received");
                    dispatch({
                      type: CalendarAction.JoinedGroup,
                      payload: {
                        currentGroup: new UserGroup(data),
                      },
                    });
                  })
                  .catch(dispatchError);
              })
              .catch(dispatchError)
          : // Create group based on invitation id
            fetch(`${UserGroup.url}/invitation/${invitation.id}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: "",
            })
              .then((response) => response.json())
              .then(({ error, data }) => {
                if (error) throw error;
                if (!data) throw new Error("no group received");
                else {
                  const insertId = data.id;
                  // Join Group
                  fetch(
                    `${UserGroup.url}/${insertId}/invitation/${invitation.id}`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: "",
                    }
                  )
                    .then((response) => response.json())
                    .then(({ error }) => {
                      if (error) throw error;
                      // Get new group info and set state.currentGroup to it
                      fetch(`${UserGroup.url}/${insertId}`)
                        .then((response) => response.json())
                        .then(({ error, data }) => {
                          if (error || !data) throw error;
                          if (!data) throw new Error("no group received");
                          const newGroup = new UserGroup(data);
                          newGroup.members
                            .filter(
                              (u: GroupMember) => u.username !== user.username
                            )
                            .forEach((u: GroupMember) => {
                              if (!u.email)
                                throw new Error(
                                  `${u.name.first} ${u.name.last} has no email`
                                );
                              sendMail(
                                u.email,
                                user.name.first +
                                  " " +
                                  user.name.last +
                                  " has joined your group",
                                "Hello " +
                                  u.name?.first +
                                  ", " +
                                  user.name.first +
                                  " " +
                                  user.name.last +
                                  " has joined your group for " +
                                  currentProject?.title,
                                dispatchError
                              );
                            });
                          dispatch({
                            type: CalendarAction.JoinedGroup,
                            payload: {
                              currentGroup: new UserGroup(newGroup),
                            },
                          });
                        })
                        .catch(dispatchError);
                    })
                    .catch(dispatchError);
                }
              })
              .catch(dispatchError);
      })
      .catch(dispatchError);
  };

  const onDeclineInvitation = (): void => {
    // set invitation to rejected for invitee
    fetch(`${Invitation.url}/${invitation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rejected: 1,
        userId: user.id,
      }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error || !data) {
          return dispatch({
            type: CalendarAction.Error,
            payload: { error },
          });
        } else {
          fetch(`${Invitation.url}/user/${user?.id}`)
            .then((response) => response.json())
            .then(({ error, data }) => {
              if (error || !data) {
                return dispatch({
                  type: CalendarAction.Error,
                  payload: { error },
                });
              }
              dispatch({
                type: CalendarAction.ReceivedInvitations,
                payload: {
                  invitations: data,
                },
              });
            });
          sendMail(
            invitation.invitor.email,
            user.name.first +
              " " +
              user.name.last +
              " has declined your group invitation",
            "Hello " +
              invitation.invitor.name.first +
              ", " +
              user.name.first +
              " " +
              user.name.last +
              " has declined your group invitation for " +
              currentProject?.title,
            dispatchError
          );
          dispatch({
            type: CalendarAction.DisplayMessage,
            payload: {
              message: "Invitation Declined",
            },
          });
        }
      });
  };

  return (
    <ListItem style={{ justifyContent: "space-between" }}>
      {invitation.invitor.name.first +
        " " +
        invitation.invitor.name.last +
        " wants to form a group with " +
        invitation.invitees
          .filter(isNotCurrentUser)
          .map((invitee) => invitee.name.first + " " + invitee.name.last)
          .join(", ") +
        (invitation.invitees.some(isNotCurrentUser) ? ", and" : "") +
        " you"}
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
