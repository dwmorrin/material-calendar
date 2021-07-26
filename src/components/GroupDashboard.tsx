import React, {
  FunctionComponent,
  useState,
  useEffect,
  useContext,
} from "react";
import {
  Dialog,
  Toolbar,
  IconButton,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  Box,
  Checkbox,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { makeTransition } from "./Transition";
import { parseAndFormatSQLDateInterval } from "../utils/date";
import UserGroup, { GroupMember } from "../resources/UserGroup";
import { AuthContext } from "./AuthContext";
import User from "../resources/User";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbsUpDownIcon from "@material-ui/icons/ThumbsUpDown";
import { sendMail } from "../utils/mail";
import Invitation from "../resources/Invitation";

const transition = makeTransition("right");

const GroupDashboard: FunctionComponent<CalendarUIProps> = ({
  state,
  dispatch,
}) => {
  const { currentGroup, currentProject } = state;
  const [users, setUsers] = useState([] as User[]);
  const [confirmationDialogIsOpen, openConfirmationDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([] as User[]);
  const { user } = useContext(AuthContext);
  const invitations = state.invitations.filter(
    (invitation) => invitation.project === currentProject?.id
  );
  const isNotCurrentUser = ({ id }: { id: number }): boolean => id !== user.id;
  useEffect(() => {
    setSelectedUsers([]);
    if (!currentProject?.id) return;
    fetch(`/api/projects/${currentProject.id}/users`)
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error || !data) {
          return dispatch({
            type: CalendarAction.Error,
            payload: { error },
          });
        }
        setUsers(data.map((user: User) => new User(user)) as User[]);
        fetch(`/api/invitations/user/${user?.id}`)
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
      });
  }, [currentProject, dispatch, state.currentGroup, user]);

  const dispatchError = (error: Error, meta?: unknown): void =>
    dispatch({ type: CalendarAction.Error, payload: { error }, meta });

  const invitationIsUnanswered = (invitation: Invitation): boolean =>
    !invitation.invitees.some(function (invitee) {
      // Get Invitations where user has yet to respond or are waiting for approval
      if (
        invitee.id === user.id &&
        (invitee.accepted === 1 || invitee.rejected === 1)
      ) {
        return true;
      } else return false;
    });

  const invitationIsPendingApproval = (invitation: Invitation): boolean => {
    return !invitation.approved && !invitation.denied;
  };

  const selectUser = (newUser: User): void => {
    const newList: User[] = selectedUsers;
    const valueExisting = newList.map((u: User) => u.id).indexOf(newUser.id);
    if (valueExisting !== -1) {
      newList.splice(valueExisting, 1);
    } else {
      newList.push(newUser);
    }
    setSelectedUsers(newList);
  };
  if (!user) return null;
  return (
    <Dialog
      fullScreen
      TransitionComponent={transition}
      open={state.groupDashboardIsOpen}
    >
      <Dialog TransitionComponent={transition} open={confirmationDialogIsOpen}>
        The group size for {state.currentProject?.title} is{" "}
        {state.currentProject?.groupSize}. <br />
        You are attempting to create a group of size: {selectedUsers.length + 1}
        . <br /> <br />
        You can make a request for admin approval for an irregular sized group,
        or you can create a group of the specified size
        <Button
          size="small"
          variant="contained"
          color="inherit"
          style={{ backgroundColor: "Green", color: "white" }}
          onClick={(): void => {
            fetch(`/api/invitations/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                invitorId: user.id,
                invitees: selectedUsers.map((u) => u.id),
                projectId: currentProject?.id,
                approved: 0,
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
                  selectedUsers.forEach((u: User) => {
                    if (!u.email)
                      return dispatchError(
                        new Error(`${u.name.first} ${u.name.last} has no email`)
                      );
                    sendMail(
                      u.email,
                      "You have been invited to a group",
                      "Hello " +
                        u.name?.first +
                        ", " +
                        user.name?.first +
                        " " +
                        user.name?.last +
                        " has invited you to join their group for " +
                        currentProject?.title,
                      dispatchError
                    );
                  });
                }
              });
          }}
        >
          Request Irregular Group Size Approval
        </Button>
        <Button
          // setting disabled={selectedUsers.length == 0} does not
          // seem to work, due to local state?
          size="small"
          variant="contained"
          color="inherit"
          onClick={(): void => openConfirmationDialog(false)}
        >
          Go Back
        </Button>
      </Dialog>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void => {
            dispatch({ type: CalendarAction.CloseGroupDashboard });
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography>{currentProject?.title}</Typography>
      </Toolbar>
      <Paper
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <section>
          <Typography variant="body2">
            {currentProject && parseAndFormatSQLDateInterval(currentProject)}
          </Typography>
        </section>
        <Typography variant="body1" style={{ marginLeft: 20, marginTop: 20 }}>
          {currentGroup ? "My Group" : "You are not in a Group"}
        </Typography>
        {currentGroup && (
          <Box
            style={{
              padding: "8px 16px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {currentGroup?.title}
            <Button
              size="small"
              variant="contained"
              color="inherit"
              onClick={(event): void => {
                event.stopPropagation();
                // remove user from group
                fetch(`/api/groups/${currentGroup.id}/user/${user.id}`, {
                  method: "DELETE",
                  headers: {},
                  body: null,
                })
                  .then((response) => response.json())
                  .then(({ error, data }) => {
                    if (error || !data) {
                      return dispatchError(error);
                    } else {
                      const invitation = invitations.find(
                        (invitation) => invitation.group_id === currentGroup.id
                      );
                      //Mark group Invitation Rejected so it doesn't show up again
                      if (invitation !== undefined) {
                        fetch(`/api/invitations/${invitation.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            rejected: 1,
                            userId: user.id,
                          }),
                        })
                          .then((response) => response.json())
                          .then(({ error, data }) => {
                            if (error || !data) return dispatchError(error);
                          })
                          .catch(dispatchError);
                      }
                      //If user was the last member of the group, delete the group
                      if (currentGroup.members.length <= 1) {
                        fetch(`/api/groups/${currentGroup.id}`, {
                          method: "DELETE",
                          headers: {},
                          body: null,
                        })
                          .then((response) => response.json())
                          .then(({ error, data }) => {
                            if (error || !data) {
                              return dispatchError(error);
                            }
                          })
                          .catch(dispatchError);
                      }
                      dispatch({ type: CalendarAction.LeftGroup });
                    }
                  });
              }}
            >
              Leave Group
            </Button>
          </Box>
        )}
        <List>
          {invitations && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body1">Pending Invitations</Typography>
              </AccordionSummary>
              {invitations
                .filter((invitation) => invitation.invitor.id === user.id)
                .map((invitation) => (
                  <ListItem
                    key={`invitation${invitation.id}`}
                    style={{ justifyContent: "space-between" }}
                  >
                    {"You sent a Group Invitation"}

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
                        <ListItem
                          key={`invitation-${invitation.id}-invitee-${invitee.id}`}
                        >
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
                          fetch(`/api/invitations/${invitation.id}`, {
                            method: "DELETE",
                            headers: {},
                            body: null,
                          })
                            .then((response) => response.json())
                            .then(({ error, data }) => {
                              if (error || !data) {
                                return dispatch({
                                  type: CalendarAction.Error,
                                  payload: { error },
                                });
                              } else {
                                //Get updated invitations
                                fetch(`/api/invitations/user/${user?.id}`)
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
                                dispatch({
                                  type: CalendarAction.DisplayMessage,
                                  payload: {
                                    message: "Invitation Canceled",
                                  },
                                });
                              }
                            });
                        }}
                      >
                        Cancel Invitation
                      </Button>
                    </section>
                  </ListItem>
                ))}
              {invitations
                .filter(function (invitation) {
                  if (
                    invitation.invitor.id !== user.id &&
                    (invitationIsPendingApproval(invitation) ||
                      invitationIsUnanswered(invitation))
                  )
                    return true;
                  else return false;
                })
                .map((invitation) => (
                  <ListItem
                    key={`invitation${invitation.id}`}
                    style={{ justifyContent: "space-between" }}
                  >
                    {invitation.invitor.name.first +
                      " " +
                      invitation.invitor.name.last +
                      " wants to form a group with " +
                      invitation.invitees
                        .filter(isNotCurrentUser)
                        .map(
                          (invitee) =>
                            invitee.name.first + " " + invitee.name.last
                        )
                        .join(", ") +
                      (invitation.invitees.some(isNotCurrentUser)
                        ? ", and"
                        : "") +
                      " you"}
                    {invitationIsUnanswered(invitation) && (
                      <ButtonGroup
                        variant="contained"
                        color="primary"
                        size="small"
                      >
                        <Button
                          style={{ backgroundColor: "Green", color: "white" }}
                          onClick={(): void => {
                            // Accept Invitation
                            fetch(`/api/invitations/${invitation.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                accepted: 1,
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
                                }
                                if (invitation.approved) {
                                  // If the group already exists, add user to it, otherwise form group with invitor and user
                                  invitation.group_id
                                    ? // Join Group
                                      fetch(
                                        `/api/groups/${invitation.group_id}/invitation/${invitation.id}`,
                                        {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: "",
                                        }
                                      )
                                        .then((response) => response.json())
                                        .then(({ error, data }) => {
                                          if (error || !data) {
                                            return dispatch({
                                              type: CalendarAction.Error,
                                              payload: { error },
                                            });
                                          } else {
                                            // Get new group info and set state.currentGroup to it
                                            fetch(
                                              `/api/groups/${invitation.group_id}`
                                            )
                                              .then((response) =>
                                                response.json()
                                              )
                                              .then(({ error, data }) => {
                                                if (error || !data) {
                                                  return dispatch({
                                                    type: CalendarAction.Error,
                                                    payload: { error },
                                                  });
                                                } else {
                                                  dispatch({
                                                    type: CalendarAction.JoinedGroup,
                                                    payload: {
                                                      currentGroup:
                                                        new UserGroup(data),
                                                    },
                                                  });
                                                }
                                              });
                                          }
                                        })
                                    : // Create group based on invitation id
                                      fetch(
                                        `/api/groups/invitation/${invitation.id}`,
                                        {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: "",
                                        }
                                      )
                                        .then((response) => response.json())
                                        .then(({ error, data }) => {
                                          if (error || !data) {
                                            return dispatch({
                                              type: CalendarAction.Error,
                                              payload: { error },
                                            });
                                          } else {
                                            const insertId = data.id;
                                            // Join Group
                                            fetch(
                                              `/api/groups/${insertId}/invitation/${invitation.id}`,
                                              {
                                                method: "POST",
                                                headers: {
                                                  "Content-Type":
                                                    "application/json",
                                                },
                                                body: "",
                                              }
                                            )
                                              .then((response) =>
                                                response.json()
                                              )
                                              .then(({ error, data }) => {
                                                if (error || !data) {
                                                  return dispatch({
                                                    type: CalendarAction.Error,
                                                    payload: { error },
                                                  });
                                                } else {
                                                  // Get new group info and set state.currentGroup to it
                                                  fetch(
                                                    `/api/groups/${insertId}`
                                                  )
                                                    .then((response) =>
                                                      response.json()
                                                    )
                                                    .then(({ error, data }) => {
                                                      if (error || !data) {
                                                        return dispatch({
                                                          type: CalendarAction.Error,
                                                          payload: { error },
                                                        });
                                                      } else {
                                                        const newGroup =
                                                          new UserGroup(data);
                                                        newGroup.members
                                                          .filter(
                                                            (u: GroupMember) =>
                                                              u.username !==
                                                              user.username
                                                          )
                                                          .forEach(
                                                            (
                                                              u: GroupMember
                                                            ) => {
                                                              if (!u.email)
                                                                return dispatchError(
                                                                  new Error(
                                                                    `${u.name.first} ${u.name.last} has no email`
                                                                  )
                                                                );
                                                              sendMail(
                                                                u.email,
                                                                user.name
                                                                  .first +
                                                                  " " +
                                                                  user.name
                                                                    .last +
                                                                  " has joined your group",
                                                                "Hello " +
                                                                  u.name
                                                                    ?.first +
                                                                  ", " +
                                                                  user.name
                                                                    .first +
                                                                  " " +
                                                                  user.name
                                                                    .last +
                                                                  " has joined your group for " +
                                                                  currentProject?.title,
                                                                dispatchError
                                                              );
                                                            }
                                                          );
                                                        //Cancel User's created invitations
                                                        invitations.forEach(
                                                          (invitation) =>
                                                            fetch(
                                                              `/api/invitations/${invitation.id}`,
                                                              {
                                                                method:
                                                                  "DELETE",
                                                                headers: {},
                                                                body: null,
                                                              }
                                                            )
                                                              .then(
                                                                (response) =>
                                                                  response.json()
                                                              )
                                                              .then(
                                                                ({
                                                                  error,
                                                                  data,
                                                                }) => {
                                                                  if (
                                                                    error ||
                                                                    !data
                                                                  ) {
                                                                    return dispatch(
                                                                      {
                                                                        type: CalendarAction.Error,
                                                                        payload:
                                                                          {
                                                                            error,
                                                                          },
                                                                      }
                                                                    );
                                                                  }
                                                                }
                                                              )
                                                        );
                                                        dispatch({
                                                          type: CalendarAction.JoinedGroup,
                                                          payload: {
                                                            currentGroup:
                                                              newGroup,
                                                          },
                                                        });
                                                      }
                                                    });
                                                }
                                              });
                                          }
                                        });
                                } else {
                                  fetch(`/api/invitations/user/${user?.id}`)
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
                                }
                              });
                          }}
                        >
                          Accept Invitation
                        </Button>
                        <Button
                          style={{ backgroundColor: "Red", color: "white" }}
                          onClick={(): void => {
                            // set invitation to rejected for invitee
                            fetch(`/api/invitations/${invitation.id}`, {
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
                                  fetch(`/api/invitations/user/${user?.id}`)
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
                                      " has rejected upir group invitation",
                                    "Hello " +
                                      invitation.invitor.name.first +
                                      ", " +
                                      user.name.first +
                                      " " +
                                      user.name.last +
                                      " has rejected your group invitation for " +
                                      currentProject?.title,
                                    dispatchError
                                  );
                                  dispatch({
                                    type: CalendarAction.DisplayMessage,
                                    payload: {
                                      message: "Invitation Rejected",
                                    },
                                  });
                                }
                              });
                          }}
                        >
                          Reject Invitation
                        </Button>
                      </ButtonGroup>
                    )}
                    {!invitationIsUnanswered(invitation) &&
                      invitationIsPendingApproval && (
                        <b>Invitation is pending admin approval</b>
                      )}
                  </ListItem>
                ))}
            </Accordion>
          )}
        </List>
        {!currentGroup && (
          <Accordion defaultExpanded={!invitations}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body1">Create New Group</Typography>
            </AccordionSummary>
            <Typography variant="body1">
              Project group size is: {currentProject?.groupSize}
            </Typography>
            <List>
              <Button
                // setting disabled={selectedUsers.length == 0} does not
                // seem to work, due to local state?
                size="small"
                variant="contained"
                color="inherit"
                onClick={(event): void => {
                  // Because button disable does not work, prevent empty invitations here
                  const approved =
                    selectedUsers.length + 1 ===
                    (currentProject?.groupSize || 0);
                  if (!approved) {
                    openConfirmationDialog(true);
                  } else {
                    event.stopPropagation();
                    // Create Invitation
                    fetch(`/api/invitations/`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        invitorId: user.id,
                        invitees: selectedUsers.map((u) => u.id),
                        projectId: currentProject?.id,
                        approved: approved,
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
                          selectedUsers.forEach((u: User) => {
                            if (!u.email)
                              return dispatchError(
                                new Error(
                                  `${u.name.first} ${u.name.last} has no email`
                                )
                              );
                            sendMail(
                              u.email,
                              "You have been invited to a group",
                              "Hello " +
                                u.name?.first +
                                ", " +
                                user.name?.first +
                                " " +
                                user.name?.last +
                                " has invited you to join their group for " +
                                currentProject?.title,
                              dispatchError
                            );
                          });
                          // Get list of invitations again (to get the new one)
                          fetch(`/api/invitations/user/${user?.id}`)
                            .then((response) => response.json())
                            .then(({ error, data }) => {
                              if (error || !data) return dispatchError(error);
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
                              message: "Invitation Sent",
                            },
                          });
                        }
                      });
                  }
                }}
              >
                Create Group
              </Button>
              {users
                ?.filter((individual) => individual.id !== user.id)
                .map((individual) => (
                  <ListItem
                    key={`course${individual.id}`}
                    style={{ justifyContent: "space-between" }}
                  >
                    {individual.name?.first + " " + individual.name?.last}
                    <Checkbox
                      onChange={(): void => selectUser(individual)}
                      size="small"
                      inputProps={{
                        "aria-label": individual.username + " Checkbox",
                      }}
                    />
                  </ListItem>
                ))}
            </List>
          </Accordion>
        )}
      </Paper>
    </Dialog>
  );
};

export default GroupDashboard;
