import React, { FC } from "react";
import {
  Typography,
  Button,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import User from "../../resources/User";
import Project from "../../resources/Project";
import { StateModifierProps } from "./types";
import createGroup from "./createInvitation";

const CreateNewGroupAccordion: FC<
  StateModifierProps & {
    defaultExpanded: boolean;
    project: Project;
    projectMembers: User[];
    setProjectMembers: (u: User[]) => void;
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
  setProjectMembers,
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
    // TODO: add comment as to why we are stopping propagation here
    event.stopPropagation();

    createGroup({
      approved,
      dispatch,
      invitees: selectedUsers,
      invitor: user,
      project: project,
      setSelectedUsers,
      setProjectMembers,
    });
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
              <Button
                onClick={(): void => toggleUser(otherUser)}
                variant="contained"
                disableElevation={selectedUsers.includes(otherUser)}
                color={
                  selectedUsers.includes(otherUser) ? "primary" : "default"
                }
              >
                {otherUser.name.first + " " + otherUser.name.last}
              </Button>
            </ListItem>
          ))}
      </List>
    </Accordion>
  );
};

export default CreateNewGroupAccordion;
