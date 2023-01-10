import React, { FunctionComponent } from "react";
import {
  Dialog,
  Button,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import { TextField } from "formik-material-ui";
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
import { SocketMessageKind, ReservationChangePayload } from "./SocketProvider";
import forward from "./ReservationForm/forward";
import { Formik, Form, Field } from "formik";
import { addEvents } from "../resources/EventsByDate";

interface FormValues {
  refundMessage: string;
  refundRequested: boolean;
}

const transition = makeTransition("left");

interface CancelationDialogProps extends CalendarUIProps {
  broadcast: (
    message: SocketMessageKind,
    payload: ReservationChangePayload
  ) => void;
  open: boolean;
  setOpen: (state: boolean) => void;
  cancelationApprovalCutoff: Date;
  gracePeriodCutoff: Date;
  isWalkIn: boolean;
}

const CancelationDialog: FunctionComponent<CancelationDialogProps> = ({
  broadcast,
  dispatch,
  state,
  open,
  setOpen,
  cancelationApprovalCutoff,
  gracePeriodCutoff,
  isWalkIn,
}) => {
  const dispatchError = (error: Error, meta?: unknown): void => {
    setOpen(false);
    dispatch({ type: CalendarAction.Error, payload: { error }, meta });
  };
  const { user } = useAuth();
  const myName = `${user.name.first} ${user.name.last}`;
  const userId = user.id;

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
  const onCancelationRequest = (values: FormValues): void => {
    const { refundRequested, refundMessage: message } = values;
    const mail: Mail[] = [];
    const refundMessage = refundRequested
      ? " They requested that project hours be refunded. The request has been sent to the administrator."
      : " They did not request that project hours be refunded, so the hours have been forfeited.";
    mail.push({
      to: groupTo(group.members),
      subject: `${myName} has ${subject}`,
      text: `You are receiving this because you are a member of ${
        group.title
      }. ${myName} has ${body}.${autoApprove ? "" : refundMessage}`,
    });
    if (!autoApprove && adminEmail && refundRequested)
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
          : refundRequested
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
        if (error || !data)
          return dispatchError(
            error || new Error("Hmm... no confirmation sent from the server")
          );
        const { reservations: resData, events: eventData } = data as {
          reservations: Reservation[];
          events: Event[];
        };
        const reservations = resData.map((res) => new Reservation(res));
        const events = eventData.map((event) => new Event(event));
        const updatedCurrentEvent: Event =
          events.find(({ id }) => id === currentEvent.id) || new Event();

        forward({
          reservationId: reservation.id,
          method: "DELETE",
          onError: dispatchError,
        });

        // send reservation info to currently connected users
        broadcast(SocketMessageKind.ReservationChanged, {
          eventId: updatedCurrentEvent.id,
          reservationId: reservation.id,
          groupId: group.id,
          projectId: project.id,
        });
        setOpen(false);
        dispatch({
          type: CalendarAction.ReceivedReservationCancelation,
          payload: {
            currentEvent: updatedCurrentEvent,
            events: addEvents(state.events, events),
            resources: {
              ...state.resources,
              [ResourceKey.Events]: events,
              [ResourceKey.Reservations]: reservations,
            },
          },
        });
      })
      .catch(dispatchError);
  };

  return (
    <Dialog TransitionComponent={transition} open={open}>
      <Formik
        initialValues={{
          refundMessage: "",
          refundRequested: false,
        }}
        onSubmit={onCancelationRequest}
      >
        {({ isSubmitting, handleSubmit, setFieldValue }): unknown => (
          <Form onSubmit={handleSubmit}>
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
                  {Reservation.rules.refundCutoffHours.toString()} hours before
                  the start of your reservation, which was at{" "}
                  {cancelationApprovalCutoffString}.)
                </p>
                <p>
                  You can send a message to the administrator using the text box
                  below.
                </p>
                <Field
                  component={TextField}
                  label="You can type a message here"
                  name="refundMessage"
                  variant="filled"
                  fullWidth
                />
              </DialogContent>
            )}
            {autoApprove ? (
              <DialogActions>
                <Button
                  type="submit"
                  color="secondary"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Cancel reservation"}
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={(): void => setOpen(false)}
                >
                  Go Back
                </Button>
              </DialogActions>
            ) : isWalkIn ? (
              <DialogActions>
                <Button
                  type="submit"
                  color="secondary"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Cancel reservation"}
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={(): void => setOpen(false)}
                >
                  Go Back
                </Button>
              </DialogActions>
            ) : (
              <DialogActions>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={isSubmitting}
                  onClick={(): void => setFieldValue("refundRequested", true)}
                >
                  {isSubmitting
                    ? "Sending..."
                    : "Cancel reservation and request refund"}
                </Button>
                <Button
                  type="submit"
                  color="secondary"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Sending..."
                    : "Cancel reservation without refund"}
                </Button>
                <Button
                  disabled={isSubmitting}
                  onClick={(): void => setOpen(false)}
                >
                  Go Back
                </Button>
              </DialogActions>
            )}
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default CancelationDialog;
