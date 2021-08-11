import React, { FC } from "react";
import {
  Typography,
  Button,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
  Checkbox,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { CalendarUIProps, CalendarAction } from "../../calendar/types";
import User from "../../resources/User";
import Project from "../../resources/Project";
import { sendMail } from "../../utils/mail";
import Invitation from "../../resources/Invitation";
import { StateModifierProps } from "./types";

const CreateNewGroupAccordion: FC<
  Omit<CalendarUIProps, "state"> &
    StateModifierProps & {
      defaultExpanded: boolean;
      currentProject: Project;
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
          .filter(({ id }) => id !== user.id)
          .map((otherUser) => (
            <ListItem
              key={`course${otherUser.id}`}
              style={{ justifyContent: "space-between" }}
            >
              {otherUser.name.first + " " + otherUser.name.last}
              <Checkbox
                onChange={(): void => selectUser(otherUser)}
                size="small"
                inputProps={{
                  "aria-label": otherUser.username + "Checkbox",
                }}
                checked={selectedUsers.includes(otherUser)}
              />
            </ListItem>
          ))}
      </List>
    </Accordion>
  );
};

export default CreateNewGroupAccordion;
