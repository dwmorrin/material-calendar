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
import createInvitation from "./createInvitation";

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
    createInvitation({
      approved: 0,
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
        The group size for {project.title} is {project.groupSize}. <br />
        You are attempting to create a group of size: {selectedUsers.length + 1}
        . <br /> <br />
        You can make a request for admin approval for an irregular sized group,
        or you can create a group of the specified size.
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          variant="contained"
          color="inherit"
          style={{ backgroundColor: "Green", color: "white" }}
          onClick={onRequest}
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
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
