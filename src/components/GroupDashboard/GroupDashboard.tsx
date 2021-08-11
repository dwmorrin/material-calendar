import React, { FC, useState, useEffect } from "react";
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
  Checkbox,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CalendarUIProps, CalendarAction } from "../../calendar/types";
import { makeTransition } from "../Transition";
import { parseAndFormatSQLDateInterval } from "../../utils/date";
import UserGroup, { GroupMember } from "../../resources/UserGroup";
import { useAuth } from "../AuthProvider";
import User from "../../resources/User";
import Project from "../../resources/Project";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import { sendMail } from "../../utils/mail";
import Invitation from "../../resources/Invitation";
import ConfirmationDialog from "./ConfirmationDialog";
import CurrentGroupBox from "./CurrentGroupBox";
import InvitationSent from "./InvitationSent";

const transition = makeTransition("right");

const InvitationInboxItem: FC<
  Omit<CalendarUIProps, "state"> & {
    currentProject: Project;
    invitation: Invitation;
    user: User;
  }
> = ({ dispatch, invitation, currentProject, user }) => {
  const isNotCurrentUser = ({ id }: { id: number }): boolean => id !== user.id;
  // TODO check for duplicates for this function
  const invitationIsUnanswered = (invitation: Invitation): boolean =>
    !invitation.invitees.some(function (invitee) {
      // Get Invitations where user has yet to respond or are waiting for approval
      if (invitee.id === user.id && (invitee.accepted || invitee.rejected)) {
        return true;
      } else return false;
    });
  // TODO check for duplicates for this function
  const invitationIsPendingApproval = (invitation: Invitation): boolean => {
    return !invitation.approvedId && !invitation.deniedId;
  };
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
                    .then(({ error, data }) => {
                      if (error || !data) {
                        return dispatch({
                          type: CalendarAction.Error,
                          payload: { error },
                        });
                      } else {
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
                      }
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
      {invitationIsUnanswered(invitation) && (
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
      {!invitationIsUnanswered(invitation) && invitationIsPendingApproval && (
        <b>Invitation is pending admin approval</b>
      )}
    </ListItem>
  );
};

const InvitationAccordion: FC<
  CalendarUIProps & {
    currentProject: Project;
    invitations: Invitation[];
    user: User;
  }
> = ({ dispatch, invitations, currentProject, user }) => {
  const invitationIsUnanswered = (invitation: Invitation): boolean =>
    !invitation.invitees.some(function (invitee) {
      // Get Invitations where user has yet to respond or are waiting for approval
      if (invitee.id === user.id && (invitee.accepted || invitee.rejected)) {
        return true;
      } else return false;
    });

  const invitationIsPendingApproval = (invitation: Invitation): boolean => {
    return !invitation.approvedId && !invitation.deniedId;
  };

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body1">Pending Invitations</Typography>
      </AccordionSummary>
      {invitations
        .filter((invitation) => invitation.invitor.id === user.id)
        .map((invitation) => (
          <InvitationSent
            key={`invitation${invitation.id}`}
            dispatch={dispatch}
            currentProject={currentProject}
            invitation={invitation}
            user={user}
          />
        ))}
      {invitations
        .filter(
          (invitation) =>
            invitation.invitor.id !== user.id &&
            (invitationIsPendingApproval(invitation) ||
              invitationIsUnanswered(invitation))
        )
        .map((invitation) => (
          <InvitationInboxItem
            key={`invitation${invitation.id}`}
            invitation={invitation}
            dispatch={dispatch}
            user={user}
            currentProject={currentProject}
          />
        ))}
    </Accordion>
  );
};

const CreateNewGroupAccordion: FC<
  Omit<CalendarUIProps, "state"> & {
    defaultExpanded: boolean;
    currentProject: Project;
    openConfirmationDialog: (open: boolean) => void;
    selectedUsers: User[];
    setSelectedUsers: (u: User[]) => void;
    user: User;
    users: User[];
  }
> = ({
  dispatch,
  defaultExpanded,
  currentProject,
  openConfirmationDialog,
  selectedUsers,
  setSelectedUsers,
  user,
  users,
}) => {
  const selectUser = (newUser: User): void => {
    const existing = selectedUsers.findIndex(({ id }) => id === newUser.id);
    setSelectedUsers(
      existing >= 0
        ? selectedUsers
            .slice(0, existing)
            .concat(selectedUsers.slice(existing + 1))
        : [...selectedUsers, newUser]
    );
  };

  const dispatchError = (error: Error, meta?: unknown): void =>
    dispatch({ type: CalendarAction.Error, payload: { error }, meta });

  const onCreateGroup = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    // Because button disable does not work, prevent empty invitations here
    const approved =
      selectedUsers.length + 1 === (currentProject.groupSize || 0);

    if (!approved) return openConfirmationDialog(true);
    // TODO: add comment as to why we are stopping propogation here
    event.stopPropagation();

    // Create Invitation
    fetch(`${Invitation.url}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invitorId: user.id,
        invitees: selectedUsers.map((u) => u.id),
        projectId: currentProject.id,
        approved,
      }),
    })
      .then((response) => response.json())
      .then(({ error }) => {
        if (error) throw error;
        selectedUsers.forEach((u: User) => {
          if (!u.email)
            throw new Error(`${u.name.first} ${u.name.last} has no email`);
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
        dispatch({
          type: CalendarAction.DisplayMessage,
          payload: {
            message: "Invitation Sent",
          },
        });
        setSelectedUsers([]);
      })
      .catch(dispatchError);
  };

  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body1">Create New Group</Typography>
      </AccordionSummary>
      <Typography variant="body1">
        Project group size is: {currentProject.groupSize}
      </Typography>
      <List>
        <Button
          // setting disabled={selectedUsers.length == 0} does not
          // seem to work, due to local state?
          size="small"
          variant="contained"
          color="inherit"
          onClick={onCreateGroup}
        >
          {selectedUsers.length == 0
            ? "Create a group by yourself"
            : "Create Group"}
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
                  "aria-label": individual.username + "Checkbox",
                }}
                checked={selectedUsers.includes(individual)}
              />
            </ListItem>
          ))}
      </List>
    </Accordion>
  );
};

const GroupDashboard: FC<CalendarUIProps> = ({ state, dispatch }) => {
  const { currentGroup, currentProject } = state;
  const [users, setUsers] = useState<User[]>([]);
  const [confirmationDialogIsOpen, openConfirmationDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { user } = useAuth();
  const invitations = state.invitations.filter(
    (invitation) => invitation.projectId === currentProject?.id
  );
  useEffect(() => {
    setSelectedUsers([]);
    if (!currentProject?.id) return;
    fetch(`${Project.url}/${currentProject.id}/users`)
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        if (!data) throw new Error("No project members received");
        setUsers(data.map((user: User) => new User(user)) as User[]);
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
          .catch((error) =>
            dispatch({
              type: CalendarAction.Error,
              payload: { error },
            })
          );
      })
      .catch((error) =>
        dispatch({
          type: CalendarAction.Error,
          payload: { error },
        })
      );
  }, [currentProject, dispatch, state.currentGroup, user]);

  return (
    <Dialog
      fullScreen
      TransitionComponent={transition}
      open={state.groupDashboardIsOpen}
    >
      <ConfirmationDialog
        state={state}
        dispatch={dispatch}
        open={confirmationDialogIsOpen}
        openConfirmationDialog={openConfirmationDialog}
        user={user}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
      />
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
          <CurrentGroupBox
            currentGroup={currentGroup}
            dispatch={dispatch}
            invitations={invitations}
            state={state}
            user={user}
          />
        )}
        <List>
          {invitations && currentProject && (
            <InvitationAccordion
              state={state}
              dispatch={dispatch}
              invitations={invitations}
              currentProject={currentProject}
              user={user}
            />
          )}
        </List>
        {!currentGroup && currentProject && (
          <CreateNewGroupAccordion
            defaultExpanded={!invitations}
            currentProject={currentProject}
            openConfirmationDialog={openConfirmationDialog}
            dispatch={dispatch}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            user={user}
            users={users}
          />
        )}
      </Paper>
    </Dialog>
  );
};

export default GroupDashboard;
