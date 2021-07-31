import React, { FunctionComponent, useState } from "react";
import {
  Dialog,
  Button,
  DialogContent,
  DialogActions,
  TextField,
} from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { useAuth } from "./AuthProvider";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Reservation from "../resources/Reservation";
import UserGroup from "../resources/UserGroup";
import Event from "../resources/Event";
import { Mail, adminEmail } from "../utils/mail";
import { formatDatetime, isBefore, nowInServerTimezone } from "../utils/date";

const transition = makeTransition("left");

interface CancelationDialogProps extends CalendarUIProps {
  open: boolean;
  setOpen: (state: boolean) => void;
  cancelationApprovalCutoff: Date;
}

const CancelationDialog: FunctionComponent<CancelationDialogProps> = ({
  dispatch,
  state,
  open,
  setOpen,
  cancelationApprovalCutoff,
}) => {
  const dispatchError = (error: Error, meta?: unknown): void =>
    dispatch({ type: CalendarAction.Error, payload: { error }, meta });
  const { user } = useAuth();
  const myName = `${user.name.first} ${user.name.last}`;
  const userId = user.id;
  const [message, setMessage] = useState("");

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
  const autoApprove = isBefore(
    nowInServerTimezone(),
    cancelationApprovalCutoff
  );
  const groupEmail = group.members.map(({ email }) => email).join(", ");
  const subject = "canceled a reservation for your group";
  const location = currentEvent.location.title;
  const whatWhenWhere = `${project.title} on ${currentEvent.start} in ${location}`;
  const body = `${subject} for ${whatWhenWhere}`;

  const cancelationApprovalCutoffString = formatDatetime(
    cancelationApprovalCutoff
  );

  const onCancelationRequest = ({ refund = false } = {}): void => {
    const mailbox = [] as Mail[];
    const refundMessage = refund
      ? " They requested that project hours be refunded. The request has been sent to the administrator."
      : " They did not request that project hours be refunded, so the hours have been forfeited.";
    mailbox.push({
      to: groupEmail,
      subject: `${myName} has ${subject}`,
      text: `Your receiving this because you are a member of ${
        group.title
      }. ${myName} has ${body}.${autoApprove ? "" : refundMessage}`,
    });
    if (!autoApprove && adminEmail && refund)
      mailbox.push({
        to: adminEmail,
        subject: "Project Hour Refund Request",
        text: `${myName} is requesting a project hour refund for their booking: ${whatWhenWhere}`,
      });
    fetch(`${Reservation.url}/cancel/${reservation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        autoApprove
          ? {
              userId,
              refundApproved: 1,
              mailbox,
            }
          : refund
          ? {
              refundRequest: true,
              refundComment: message,
              userId,
              mailbox,
            }
          : { userId, mailbox }
      ),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error || !data) return dispatchError(error || new Error("no data"));
        // data = {reservation: new reservation, event: new event}
        const { currentEvent } = data;
        const events = (state.resources[ResourceKey.Events] as Event[]).filter(
          ({ id }) => id !== currentEvent.id
        );
        const reservations = (
          state.resources[ResourceKey.Reservations] as Reservation[]
        ).filter(({ id }) => id !== reservation.id);
        setOpen(false);
        dispatch({
          type: CalendarAction.ReceivedReservationCancelation,
          payload: {
            currentEvent,
            resources: {
              ...state.resources,
              [ResourceKey.Events]: [...events, currentEvent],
              [ResourceKey.Reservations]: [...reservations],
            },
          },
        });
      });
  };

  return (
    <Dialog TransitionComponent={transition} open={open}>
      {autoApprove ? (
        <DialogContent>Are you sure you want to cancel?</DialogContent>
      ) : (
        <DialogContent>
          <p>
            You can still cancel, but your time will not be automatically
            refunded.
          </p>
          <p>
            (You needed to cancel{" "}
            {Reservation.rules.refundCutoffHours.toString()} hours before the
            start of your reservation, which was at{" "}
            {cancelationApprovalCutoffString}.)
          </p>
          <p>
            You can send a message to the administrator using the text box
            below.
          </p>
          <TextField
            id="filled-basic"
            label="You can type a message here"
            variant="filled"
            onChange={(event): void => {
              event.stopPropagation();
              setMessage(event.target.value);
            }}
          />
        </DialogContent>
      )}
      {autoApprove ? (
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            onClick={(): void => onCancelationRequest({ refund: true })}
          >
            Cancel reservation
          </Button>
          <Button onClick={(): void => setOpen(false)}>Go Back</Button>
        </DialogActions>
      ) : (
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            // style={{ backgroundColor: "yellow", color: "black" }}
            onClick={(): void => onCancelationRequest({ refund: true })}
          >
            Cancel Reservation and request refund
          </Button>
          <Button
            color="secondary"
            variant="contained"
            // style={{ backgroundColor: "salmon", color: "white" }}
            onClick={(): void => onCancelationRequest()}
          >
            Cancel Reservation without refund
          </Button>
          <Button onClick={(): void => setOpen(false)}>Go Back</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CancelationDialog;
