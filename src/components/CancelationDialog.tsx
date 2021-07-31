import React, { FunctionComponent } from "react";
import {
  Dialog,
  Button,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { useAuth } from "./AuthProvider";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Reservation from "../resources/Reservation";
import Event from "../resources/Event";
import UserGroup from "../resources/UserGroup";
import { Mail } from "../utils/mail";
import { formatDatetime } from "../utils/date";

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
  const { REACT_APP_CANCELATION_REFUND_CUTOFF_HOURS } = process.env;
  if (
    !REACT_APP_CANCELATION_REFUND_CUTOFF_HOURS ||
    isNaN(Number(REACT_APP_CANCELATION_REFUND_CUTOFF_HOURS))
  ) {
    dispatchError(new Error("no cancelation refund cutoff hours set"));
    return null;
  }
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
      ? "requested that project hours be refunded. The request has been sent to the administrator."
      : "did not request that project hours be refunded, so the hours have been forfeited.";
    const adminEmail = process.env.REACT_APP_ADMIN_EMAIL;
    mailbox.push({
      to: groupEmail,
      subject: `${myName} has ${subject}`,
      text: `Your receiving this because you are a member of ${group.title}. ${myName} has ${body}. They ${refundMessage}`,
      onError: dispatchError,
    });
    if (adminEmail && refund)
      mailbox.push({
        to: adminEmail,
        subject: "Project Hour Refund Request",
        text: `${myName} is requesting a project hour refund for their booking: ${whatWhenWhere}`,
        onError: dispatchError,
      });
    fetch(`${Reservation.url}/cancel/${reservation.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        refund
          ? {
              // TODO do not use integers if these are booleans
              refundRequest: 1,
              refundComment: 1,
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
        const { event, reservation } = data;
        const currentEvent = new Event(event);
        const events = (state.resources[ResourceKey.Events] as Event[]).filter(
          ({ id }) => id !== currentEvent.id
        );
        const reservations = (
          state.resources[ResourceKey.Reservations] as Reservation[]
        ).filter(({ id }) => id !== reservation.id);
        openCancelationDialog(false);
        dispatch({
          type: CalendarAction.ReceivedReservationCancelation,
          payload: {
            currentEvent,
            resources: {
              ...state.resources,
              [ResourceKey.Events]: [...events, currentEvent],
              [ResourceKey.Reservations]: [
                ...reservations,
                new Reservation(reservation),
              ],
            },
          },
        });
      });
  };

  return (
    <Dialog TransitionComponent={transition} open={cancelationDialogIsOpen}>
      <DialogContent>
        <p>
          The cancelation window for this booking has passed. You can still
          cancel this session, but your project hours will not be automatically
          refunded. You can request that the administrator refund your hours
          below.
        </p>
        <p>
          (For this reservation, you needed to cancel{" "}
          {REACT_APP_CANCELATION_REFUND_CUTOFF_HOURS} hours before the start of
          your reservation, which was at {cancelationApprovalCutoffString}.)
        </p>
      </DialogContent>
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
        <Button onClick={(): void => openCancelationDialog(false)}>
          Go Back
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CancelationDialog;
