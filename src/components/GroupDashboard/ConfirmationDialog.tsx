import React, { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../../calendar/types";
import { makeTransition } from "../Transition";
import Invitation from "../../resources/Invitation";
import { StateModifierProps } from "./types";
import { Mail } from "../../utils/mail";
import Project from "../../resources/Project";
import User from "../../resources/User";

const transition = makeTransition("right");

const ConfirmationDialog: FC<
  Omit<CalendarUIProps, "state"> &
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
    const name = User.formatName(user.name);

    const mail: Mail = {
      to: selectedUsers
        .map(({ email }) => email)
        .filter(String)
        .join(),
      subject: "You have been invited to a group",
      text: `${name} has invited you to join their group for ${project.title}`,
    };

    fetch(`${Invitation.url}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invitorId: user.id,
        invitees: selectedUsers.map((u) => u.id),
        projectId: project.id,
        approved: 0,
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
        openConfirmationDialog(false);
      })
      .catch((error) =>
        dispatch({ type: CalendarAction.Error, payload: { error } })
      );
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
