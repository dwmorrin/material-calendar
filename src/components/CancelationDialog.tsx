import React, { FunctionComponent, useState } from "react";
import {
  Dialog,
  Button,
  DialogContent,
  DialogActions,
  TextField,
} from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "./types";
import { useAuth } from "./AuthProvider";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Reservation from "../resources/Reservation";
import UserGroup from "../resources/UserGroup";
import Event from "../resources/Event";
import { Mail, adminEmail, groupTo } from "../utils/mail";
import { formatDatetime, isBefore, nowInServerTimezone } from "../utils/date";

const transition = makeTransition("left");

interface CancelationDialogProps extends CalendarUIProps {
  open: boolean;
  setOpen: (state: boolean) => void;
  cancelationApprovalCutoff: Date;
  gracePeriodCutoff: Date;
  isWalkIn: boolean;
}

const CancelationDialog: FunctionComponent<CancelationDialogProps> = ({
  dispatch,
  state,
  open,
  setOpen,
  cancelationApprovalCutoff,
  gracePeriodCutoff,
  isWalkIn,
}) => {
  const dispatchError = (error: Error, meta?: unknown): void =>
    dispatch({ type: CalendarAction.Error, payload: { error }, meta });
  const { user } = useAuth();
  const myName = `${user.name.first} ${user.name.last}`;
  const userId = user.id;
  const [message, setMessage] = useState("");

  const { currentEvent } = state;
  if (!currentEvent) return null;
  const { reservation } = currentEvent;
  if (!reservation) return null;
  const group = (state.resources[ResourceKey.Groups] as UserGroup[]).find(
    ({ id }) => id === reservation.groupId
  );
  if (!group) return null;
  const project = (state.resources[ResourceKey.Projects] as Project[]).find(
    ({ id }) => id === group.projectId
  );
  if (!project) return null;

  const now = nowInServerTimezone();
  const autoApprove =
    isBefore(now, cancelationApprovalCutoff) ||
    isBefore(now, gracePeriodCutoff);
  const subject = "canceled a reservation for your group";
  const location = currentEvent.location.title;
  const whatWhenWhere = `${project.title} on ${currentEvent.start} in ${location}`;
  const body = `${subject} for ${whatWhenWhere}`;

  const cancelationApprovalCutoffString = formatDatetime(
    cancelationApprovalCutoff
  );
  const onCancelationRequest = ({ refund = false } = {}): void => {
    const mail: Mail[] = [];
    const refundMessage = refund
      ? " They requested that project hours be refunded. The request has been sent to the administrator."
      : " They did not request that project hours be refunded, so the hours have been forfeited.";
    mail.push({
      to: groupTo(group.members),
      subject: `${myName} has ${subject}`,
      text: `You are receiving this because you are a member of ${
        group.title
      }. ${myName} has ${body}.${autoApprove ? "" : refundMessage}`,
    });
    if (!autoApprove && adminEmail && refund)
      mail.push({
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
              refundApproved: true,
              mail,
            }
          : refund
          ? {
              refundRequest: true,
              refundComment: message,
              userId,
              mail,
            }
          : { userId, mail }
      ),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error || !data) return dispatchError(error || new Error("no data"));
        const { reservations: resData, events: eventData } = data as {
          reservations: Reservation[];
          events: Event[];
        };
        const reservations = resData.map((res) => new Reservation(res));
        const events = eventData.map((event) => new Event(event));
        const updatedCurrentEvent: Event =
          events.find(({ id }) => id === currentEvent.id) || new Event();

        setOpen(false);
        dispatch({
          type: CalendarAction.ReceivedReservationCancelation,
          payload: {
            currentEvent: updatedCurrentEvent,
            resources: {
              ...state.resources,
              [ResourceKey.Events]: events,
              [ResourceKey.Reservations]: reservations,
            },
          },
        });
      });
  };
  return (
    <Dialog TransitionComponent={transition} open={open}>
      {autoApprove || isWalkIn ? (
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
            fullWidth
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
      ) : isWalkIn ? (
        <DialogActions>
          <Button
            color="secondary"
            variant="contained"
            // style={{ backgroundColor: "salmon", color: "white" }}
            onClick={(): void => onCancelationRequest()}
          >
            Cancel Reservation
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
