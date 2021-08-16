import React, { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";
import { makeTransition } from "../Transition";
import { StateModifierProps } from "./types";
import Project from "../../resources/Project";
import createGroup from "./createInvitation";

const transition = makeTransition("right");

const ConfirmationDialog: FC<
  StateModifierProps & {
    open: boolean;
    project: Project;
  }
> = ({
  dispatch,
  open,
  openConfirmationDialog,
  project,
  selectedUsers,
  setSelectedUsers,
  user,
}) => {
  const onRequest = (): void => {
    createGroup({
      approved: false,
      dispatch,
      invitees: selectedUsers,
      invitor: user,
      project,
      setSelectedUsers,
    }).then(() => openConfirmationDialog(false));
  };

  return (
    <Dialog TransitionComponent={transition} open={open}>
      <DialogContent>
        {project.title} requires a group size of {project.groupSize}. <br />
        You are attempting to create a group size of {selectedUsers.length + 1}.
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={onRequest}
        >
          Request Irregular Group Size and wait for approval
        </Button>
        <Button
          size="small"
          variant="contained"
          onClick={(): void => openConfirmationDialog(false)}
        >
          Go Back and change group size
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
