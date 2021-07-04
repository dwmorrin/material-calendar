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
import UserGroup from "../resources/UserGroup";
import { AuthContext } from "./AuthContext";
import User from "../resources/User";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import ThumbsUpDownIcon from "@material-ui/icons/ThumbsUpDown";

const transition = makeTransition("right");

const GroupDashboard: FunctionComponent<CalendarUIProps> = ({
  state,
  dispatch,
}) => {
  const { currentGroup, currentProject } = state;
  const [users, setUsers] = useState([] as User[]);
  const [invitations, setInvitations] = useState(
    [] as {
      id: number;
      confirmed: number;
      project: number;
      invitor: { id: number; name: { last: string; first: string } };
      invitees: {
        id: number;
        accepted: number;
        rejected: number;
        name: { last: string; first: string };
      }[];
      group_id: number;
    }[]
  );
  const [requestedUsers, setRequestedUsers] = useState([] as number[]);
  const { user } = useContext(AuthContext);
  useEffect(() => {
    setRequestedUsers([]);
    if (!currentProject?.id) return;
    fetch(`/api/projects/${currentProject.id}/users`)
      .then((response) => response.json())
      .then(({ error, data, context }) => {
        if (error || !data) {
          return dispatch({
            type: CalendarAction.Error,
            payload: { error },
            meta: context,
          });
        }
        setUsers(data.map((user: User) => new User(user)) as User[]);
        fetch(`/api/invitations/user/${user?.id}/project/${currentProject.id}`)
          .then((response) => response.json())
          .then(({ error, data, context }) => {
            if (error || !data) {
              return dispatch({
                type: CalendarAction.Error,
                payload: { error },
                meta: context,
              });
            }
            setInvitations(data);
          });
      });
  }, [currentProject, dispatch, state.currentGroup, user]);

  const selectUser = (userId: number): void => {
    const newList: number[] = requestedUsers;
    const valueExisting = newList.indexOf(userId);
    if (valueExisting !== -1) {
      newList.splice(valueExisting, 1);
    } else {
      newList.push(userId);
    }
    setRequestedUsers(newList);
  };
  if (!user) return null;
  return (
    <Dialog
      fullScreen
      TransitionComponent={transition}
      open={state.groupDashboardIsOpen}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseGroupDashboard })
          }
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
                  .then(({ error, data, context }) => {
                    if (error || !data) {
                      return dispatch({
                        type: CalendarAction.Error,
                        payload: { error },
                        meta: context,
                      });
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
                          .then(({ error, data, context }) => {
                            if (error || !data) {
                              return dispatch({
                                type: CalendarAction.Error,
                                payload: { error },
                                meta: context,
                              });
                            }
                          });
                      }
                      //If user was the last member of the group, delete the group
                      if (currentGroup.members.length <= 1) {
                        fetch(`/api/groups/${currentGroup.id}`, {
                          method: "DELETE",
                          headers: {},
                          body: null,
                        })
                          .then((response) => response.json())
                          .then(({ error, data, context }) => {
                            if (error || !data) {
                              return dispatch({
                                type: CalendarAction.Error,
                                payload: { error },
                                meta: context,
                              });
                            }
                          });
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
                .filter((invitation) => invitation.confirmed !== 1)
                .map((invitation) => (
                  <ListItem
                    key={`invitation${invitation.id}`}
                    style={{ justifyContent: "space-between" }}
                  >
                    {"You sent a Group Invitation"}
                    <section
                      style={{
                        textAlign: "center",
                        flexDirection: "column",
                        justifyContent: "space-around",
                      }}
                    >
                      {invitation.invitees.map((invitee) => (
                        <ListItem key={`invitee${invitee.id}`}>
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
                            .then(({ error, data, context }) => {
                              if (error || !data) {
                                return dispatch({
                                  type: CalendarAction.Error,
                                  payload: { error },
                                  meta: context,
                                });
                              } else {
                                const invites = invitations;
                                invites.splice(
                                  invites
                                    .map(function (x) {
                                      return x.id;
                                    })
                                    .indexOf(invitation.id),
                                  1
                                );
                                // Remove invitation from state
                                setInvitations(invites);
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
                .filter((invitation) => invitation.invitor.id !== user.id)
                .filter(
                  (invitation) =>
                    !invitation.invitees.some(function (invitee) {
                      // Get Invitations where user has yet to respond
                      if (
                        invitee.id === user.id &&
                        (invitee.accepted === 1 || invitee.rejected === 1)
                      ) {
                        return true;
                      } else return false;
                    })
                )
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
                        .filter(function (invitee) {
                          if (
                            invitee.id !==
                            user.id /* && invitee.accepted == 1 */
                          )
                            return true;
                        })
                        .map(
                          (invitee) =>
                            invitee.name.first + " " + invitee.name.last
                        )
                        .join(", ") +
                      (invitation.invitees.filter(function (invitee) {
                        if (
                          invitee.id !== user.id /* && invitee.accepted == 1 */
                        )
                          return true;
                      }).length
                        ? ", and"
                        : "") +
                      " you"}
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
                            .then(({ error, data, context }) => {
                              if (error || !data) {
                                return dispatch({
                                  type: CalendarAction.Error,
                                  payload: { error },
                                  meta: context,
                                });
                              } else {
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
                                      .then(({ error, data, context }) => {
                                        if (error || !data) {
                                          return dispatch({
                                            type: CalendarAction.Error,
                                            payload: { error },
                                            meta: context,
                                          });
                                        } else {
                                          // Get new group info and set state.currentGroup to it
                                          fetch(
                                            `/api/groups/${invitation.group_id}`
                                          )
                                            .then((response) => response.json())
                                            .then(
                                              ({ error, data, context }) => {
                                                if (error || !data) {
                                                  return dispatch({
                                                    type: CalendarAction.Error,
                                                    payload: { error },
                                                    meta: context,
                                                  });
                                                } else {
                                                  dispatch({
                                                    type: CalendarAction.JoinedGroup,
                                                    payload: {
                                                      currentGroup:
                                                        new UserGroup(data[0]),
                                                    },
                                                  });
                                                }
                                              }
                                            );
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
                                      .then(({ error, data, context }) => {
                                        if (error || !data) {
                                          return dispatch({
                                            type: CalendarAction.Error,
                                            payload: { error },
                                            meta: context,
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
                                            .then((response) => response.json())
                                            .then(
                                              ({ error, data, context }) => {
                                                if (error || !data) {
                                                  return dispatch({
                                                    type: CalendarAction.Error,
                                                    payload: { error },
                                                    meta: context,
                                                  });
                                                } else {
                                                  // Get new group info and set state.currentGroup to it
                                                  fetch(
                                                    `/api/groups/${insertId}`
                                                  )
                                                    .then((response) =>
                                                      response.json()
                                                    )
                                                    .then(
                                                      ({
                                                        error,
                                                        data,
                                                        context,
                                                      }) => {
                                                        if (error || !data) {
                                                          return dispatch({
                                                            type: CalendarAction.Error,
                                                            payload: { error },
                                                            meta: context,
                                                          });
                                                        } else {
                                                          dispatch({
                                                            type: CalendarAction.JoinedGroup,
                                                            payload: {
                                                              currentGroup:
                                                                new UserGroup(
                                                                  data[0]
                                                                ),
                                                            },
                                                          });
                                                        }
                                                      }
                                                    );
                                                }
                                              }
                                            );
                                        }
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
                            .then(({ error, data, context }) => {
                              if (error || !data) {
                                return dispatch({
                                  type: CalendarAction.Error,
                                  payload: { error },
                                  meta: context,
                                });
                              } else {
                                const invites = invitations;
                                invites.splice(
                                  invites
                                    .map(function (x) {
                                      return x.id;
                                    })
                                    .indexOf(invitation.id),
                                  1
                                );
                                // Remove invitation from state
                                setInvitations(invites);
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
            <List>
              <Button
                // setting disabled={requestedUsers.length == 0} does not
                // seem to work, due to local state?
                size="small"
                variant="contained"
                color="inherit"
                onClick={(event): void => {
                  // Because button disable does not work, prevent empty invitations here
                  if (requestedUsers.length > 0) {
                    event.stopPropagation();
                    // Create Invitation
                    fetch(`/api/invitations/`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        invitorId: user.id,
                        invitees: requestedUsers,
                        projectId: currentProject?.id,
                      }),
                    })
                      .then((response) => response.json())
                      .then(({ error, data, context }) => {
                        if (error || !data) {
                          return dispatch({
                            type: CalendarAction.Error,
                            payload: { error },
                            meta: context,
                          });
                        } else {
                          // Get list of invitations again (to get the new one)
                          fetch(
                            `/api/invitations/user/${user?.id}/project/${currentProject?.id}`
                          )
                            .then((response) => response.json())
                            .then(({ error, data, context }) => {
                              if (error || !data) {
                                return dispatch({
                                  type: CalendarAction.Error,
                                  payload: { error },
                                  meta: context,
                                });
                              }
                              setInvitations(data);
                              dispatch({
                                type: CalendarAction.DisplayMessage,
                                payload: {
                                  message: "Invitation Sent",
                                },
                              });
                            });
                        }
                      });
                  } else {
                    dispatch({
                      type: CalendarAction.DisplayMessage,
                      payload: {
                        message:
                          "You must select at least one user to create a group invitation",
                      },
                    });
                  }
                }}
              >
                Invite Selected Users to Group
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
                      onChange={(): void => selectUser(individual.id)}
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
