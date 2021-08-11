import React, { FC } from "react";
import { Dialog, Button } from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../../calendar/types";
import { makeTransition } from "../Transition";
import User from "../../resources/User";
import Invitation from "../../resources/Invitation";

const transition = makeTransition("right");

const ConfirmationDialog: FC<
  CalendarUIProps & {
    open: boolean;
    openConfirmationDialog: (open: boolean) => void;
    user: User;
    selectedUsers: User[];
    setSelectedUsers: (u: User[]) => void;
  }
> = ({
  state,
  dispatch,
  open,
  openConfirmationDialog,
  selectedUsers,
  setSelectedUsers,
  user,
}) => (
  <Dialog TransitionComponent={transition} open={open}>
    The group size for {state.currentProject?.title} is{" "}
    {state.currentProject?.groupSize}. <br />
    You are attempting to create a group of size: {selectedUsers.length + 1}
    . <br /> <br />
    You can make a request for admin approval for an irregular sized group, or
    you can create a group of the specified size
    <Button
      size="small"
      variant="contained"
      color="inherit"
      style={{ backgroundColor: "Green", color: "white" }}
      onClick={(): void => {
        fetch(`${Invitation.url}/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invitorId: user.id,
            invitees: selectedUsers.map((u) => u.id),
            projectId: state.currentProject?.id,
            approved: 0,
          }),
        })
          .then((response) => response.json())
          .then(({ error }) => {
            if (error) throw error;
            selectedUsers.forEach((u: User) => {
              if (!u.email)
                throw new Error(`${u.name.first} ${u.name.last} has no email`);
              // TODO send email in previous fetch
              // sendMail(
              //   u.email,
              //   "You have been invited to a group",
              //   "Hello " +
              //     u.name?.first +
              //     ", " +
              //     user.name?.first +
              //     " " +
              //     user.name?.last +
              //     " has invited you to join their group for " +
              //     state.currentProject?.title,
              //   dispatchError
              // );
            });
            fetch(`${Invitation.url}/user/${user?.id}`)
              .then((response) => response.json())
              .then(({ error, data }) => {
                if (error) throw error;
                if (!data) throw new Error("no invitations received");
                dispatch({
                  type: CalendarAction.ReceivedInvitations,
                  payload: {
                    invitations: data,
                  },
                });
              })
              .catch((error) =>
                dispatch({ type: CalendarAction.Error, payload: { error } })
              );
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
);

export default ConfirmationDialog;
