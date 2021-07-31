import React, { FunctionComponent } from "react";
import { Dialog, Button } from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { useAuth } from "./AuthProvider";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Reservation from "../resources/Reservation";
import UserGroup from "../resources/UserGroup";
import { sendMailOptions } from "../utils/mail";

const transition = makeTransition("left");

interface CancelationDialogProps extends CalendarUIProps {
  cancelationDialogIsOpen: boolean;
  openCancelationDialog: (state: boolean) => void;
  cancelationApprovalCutoff: Date;
}

const CancelationDialog: FunctionComponent<CancelationDialogProps> = ({
  dispatch,
  state,
  cancelationDialogIsOpen,
  openCancelationDialog,
  cancelationApprovalCutoff,
}) => {
  const dispatchError = (error: Error, meta?: unknown): void =>
    dispatch({ type: CalendarAction.Error, payload: { error }, meta });
  const { user } = useAuth();
  const myName = `${user.name.first} ${user.name.last}`;
  const userId = user.id;

  const { currentEvent } = state;
  if (!currentEvent) {
    dispatchError(new Error("No event selected"));
    return null;
  }
  const { reservation } = currentEvent;
  if (!reservation) {
    dispatchError(new Error("No reservation to cancel"));
    return null;
  }
  const group = (state.resources[ResourceKey.Groups] as UserGroup[]).find(
    ({ id }) => id === reservation.groupId
  );
  if (!group) {
    dispatchError(new Error("No group"));
    return null;
  }
  const project = (state.resources[ResourceKey.Projects] as Project[]).find(
    ({ id }) => id === group.projectId
  );
  if (!project) {
    dispatchError(new Error("No project"));
    return null;
  }
  const groupEmail = group.members.map(({ email }) => email).join(", ");

  // TODO just send the mail in the first body; don't double fetch
  const onRequestIrregularGroupSizeApproval = (): void => {
    fetch(`${Reservation.url}/cancel/${reservation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // TODO do not use integers if these are booleans
        refundRequest: 1,
        refundComment: 1,
        userId,
      }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error || !data)
          return dispatch({
            type: CalendarAction.Error,
            payload: { error: error || new Error("no data") },
          });
        const subject = "canceled a reservation for your group";
        const body = `${subject} for ${project.title} on ${currentEvent.start} in ${currentEvent.location.title}`;
        const refundMessage =
          "requested that project hours be refunded, so a request has been sent to the admin.";
        sendMailOptions({
          to: groupEmail,
          subject: `${myName} has ${subject}`,
          body: `Hello ${group.title}, ${myName} has ${body}. They ${refundMessage}`,
          onError: dispatchError,
        });
        const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
        if (adminEmail)
          sendMailOptions({
            to: adminEmail,
            subject: "Project Hour Refund Request",
            body:
              `Hello,
            ${myName} is requesting a project hour refund for their booking for ${project.title} ` +
              `in ${currentEvent.location.title} on ${currentEvent.start}`,
            onError: dispatchError,
          });
      });
  };

  // TODO just send the mail in the first body; don't double fetch
  const onCancelWithoutRefund = (): void => {
    fetch(`${Reservation.url}/cancel/${reservation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error || !data) {
          return dispatch({
            type: CalendarAction.Error,
            payload: { error: error || new Error("no data") },
          });
        }
        const subject = "canceled a reservation for your group";
        const body = `${subject} for ${project?.title} on ${currentEvent.start} in ${currentEvent.location.title}`;
        const refundMessage =
          "did not request that project hours be refunded, so the hours have been forfeit.";
        sendMailOptions({
          to: groupEmail,
          subject: `${myName} has ${subject}`,
          body: `Hello ${group.title}, ${myName} has ${body}. They ${refundMessage}`,
          onError: dispatchError,
        });
      });
  };

  return (
    <Dialog TransitionComponent={transition} open={cancelationDialogIsOpen}>
      The cancelation window for this booking has passed. You can still cancel
      this session, but your project hours will not be automatically refunded.
      You can request that the administrator refund your hours below.
      <br />
      For reference, to automatically get project hours refunded you need to
      cancel {process.env.REACT_APP_CANCELATION_REFUND_CUTOFF_HOURS} hours
      before the start of your reservation, at {cancelationApprovalCutoff}.
      <Button
        color="primary"
        style={{ backgroundColor: "yellow", color: "black" }}
        onClick={onRequestIrregularGroupSizeApproval}
      >
        Request Irregular Group Size Approval
      </Button>
      <Button
        color="inherit"
        style={{ backgroundColor: "salmon", color: "white" }}
        onClick={onCancelWithoutRefund}
      >
        Cancel Reservation and do not request project hours be refunded
      </Button>
      <Button
        color="inherit"
        onClick={(): void => openCancelationDialog(false)}
      >
        Go Back
      </Button>
    </Dialog>
  );
};

export default CancelationDialog;
