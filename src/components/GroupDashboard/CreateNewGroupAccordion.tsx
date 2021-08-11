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
import Invitation from "../../resources/Invitation";
import { StateModifierProps } from "./types";
import { Mail } from "../../utils/mail";

const CreateNewGroupAccordion: FC<
  Omit<CalendarUIProps, "state"> &
    StateModifierProps & {
      defaultExpanded: boolean;
      project: Project;
      projectMembers: User[];
    }
> = ({
  dispatch,
  defaultExpanded,
  project,
  openConfirmationDialog,
  selectedUsers,
  setSelectedUsers,
  user,
  projectMembers,
}) => {
  const toggleUser = (newUser: User): void => {
    const existing = selectedUsers.findIndex(({ id }) => id === newUser.id);
    setSelectedUsers(
      existing >= 0
        ? selectedUsers
            .slice(0, existing)
            .concat(selectedUsers.slice(existing + 1))
        : [...selectedUsers, newUser]
    );
  };

  const onCreateGroup = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ): void => {
    // Because button disable does not work, prevent empty invitations here
    const approved = selectedUsers.length + 1 === (project.groupSize || 0);

    if (!approved) return openConfirmationDialog(true);
    // TODO: add comment as to why we are stopping propogation here
    event.stopPropagation();

    const name =
      [user.name.first, user.name.last].join(" ") || "An anonymous user";

    const mail: Mail = {
      to: selectedUsers
        .map(({ email }) => email)
        .filter(String)
        .join(),
      subject: "You have been invited to a group",
      text: `${name} has invited you to join their group for ${project.title}`,
    };

    // Create Invitation
    fetch(`${Invitation.url}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invitorId: user.id,
        invitees: selectedUsers.map((u) => u.id),
        projectId: project.id,
        approved,
        mail,
      }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error) throw error;
        if (!Array.isArray(data))
          throw new Error("No invitation info received");
        dispatch({
          type: CalendarAction.ReceivedInvitations,
          payload: {
            invitations: (data as Invitation[]).map((i) => new Invitation(i)),
          },
        });
        dispatch({
          type: CalendarAction.DisplayMessage,
          payload: {
            message: "Invitation Sent",
          },
        });
        setSelectedUsers([]);
      })
      .catch((error) =>
        dispatch({ type: CalendarAction.Error, payload: { error } })
      );
  };

  return (
    <Accordion defaultExpanded={defaultExpanded}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="body1">Create New Group</Typography>
      </AccordionSummary>
      <Typography variant="body1">
        Project group size is: {project.groupSize}
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
        {projectMembers
          .filter(({ id }) => id !== user.id)
          .map((otherUser) => (
            <ListItem
              key={`course${otherUser.id}`}
              style={{ justifyContent: "space-between" }}
            >
              {otherUser.name.first + " " + otherUser.name.last}
              <Checkbox
                onChange={(): void => toggleUser(otherUser)}
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
