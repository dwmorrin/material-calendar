import React, { FunctionComponent } from "react";
import {
  Dialog,
  Button,
  DialogContent,
  DialogActions,
  List,
  ListItem,
} from "@material-ui/core";
import { CheckboxWithLabel, TextField } from "formik-material-ui";
import { CalendarUIProps, CalendarAction } from "./types";
import { useAuth } from "./AuthProvider";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Reservation from "../resources/Reservation";
import UserGroup from "../resources/UserGroup";
import Event from "../resources/Event";
import { Mail, adminEmail, groupTo } from "../utils/mail";
import {
  formatDatetime,
  isBefore,
  nowInServerTimezone,
  parseAndFormatSQLDatetimeInterval,
} from "../utils/date";
import { SocketMessageKind, ReservationChangePayload } from "./SocketProvider";
import forward from "./ReservationForm/forward";
import { Formik, Form, Field } from "formik";
import { addEvents } from "../resources/EventsByDate";

interface FormValues {
  eventIds: Record<number, boolean>;
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
  subEvents: Event[];
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
  subEvents,
}) => {
  const dispatchError = (error: Error, meta?: unknown): void => {
    setOpen(false);
    dispatch({ type: CalendarAction.Error, payload: { error }, meta });
  };
  const { user } = useAuth();
  const myName = `${user.name.first} ${user.name.last}`;

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
    const selectedEvents: Event[] = Object.entries(values.eventIds).reduce(
      (ids, [id, selected]) =>
        selected
          ? [...ids, subEvents.find((e) => e.id === +id) || new Event()]
          : ids,
      [] as Event[]
    );
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

    const eventIds = selectedEvents.map(({ id }) => id);
    fetch(`${Reservation.url}/cancel`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventIds,
        reservationIds: selectedEvents.map((e) => e.reservation?.id || 0),
        groupId: selectedEvents[0].reservation?.groupId || 0,
        projectId: selectedEvents[0].reservation?.projectId || 0,
        refundApproved: autoApprove,
        mail,
        refundRequest: refundRequested,
        refundComment: message,
      }),
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
        const updateEventArray = eventData.map((event) => new Event(event));
        const eventsFromState = state.resources[ResourceKey.Events] as Event[];
        for (const event of updateEventArray) {
          const i = eventsFromState.findIndex((e) => e.id === event.id);
          if (i < 0) eventsFromState.push(event);
          else eventsFromState[i] = event;
        }
        const updatedCurrentEvent: Event =
          updateEventArray.find(({ id }) => id === currentEvent.id) ||
          new Event();

        forward({
          reservationId: reservation.id,
          method: "DELETE",
          onError: dispatchError,
        });

        // send reservation info to currently connected users
        broadcast(SocketMessageKind.ReservationChanged, {
          eventIds,
          reservationId: reservation.id,
          groupId: group.id,
          projectId: project.id,
        });
        setOpen(false);
        dispatch({
          type: CalendarAction.ReceivedReservationCancelation,
          payload: {
            currentEvent: updatedCurrentEvent,
            events: addEvents(state.events, updateEventArray),
            resources: {
              ...state.resources,
              [ResourceKey.Events]: eventsFromState,
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
          eventIds: subEvents.reduce(
            (dict, { id }) => ({ ...dict, [String(id)]: true }),
            {} as Record<string, boolean>
          ),
          refundMessage: "",
          refundRequested: false,
        }}
        onSubmit={onCancelationRequest}
      >
        {({ isSubmitting, handleSubmit, setFieldValue, values }): unknown => (
          <Form onSubmit={handleSubmit}>
            <DialogContent>
              {subEvents.length > 1 && (
                <>
                  <p>Select all the reservations you want to cancel</p>
                  <List>
                    {subEvents.map(({ id, start, originalEnd }) => (
                      <ListItem key={`cancel-list-${id}`}>
                        <Field
                          Label={{
                            label:
                              parseAndFormatSQLDatetimeInterval({
                                start,
                                end: originalEnd,
                              }) +
                              ": " +
                              (values.eventIds[String(id)]
                                ? "YES CANCEL"
                                : "NOT CANCEL"),
                          }}
                          type="checkbox"
                          name={`eventIds[${id}]`}
                          component={CheckboxWithLabel}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              {autoApprove || isWalkIn ? (
                <p>Are you sure you want to cancel?</p>
              ) : (
                <>
                  <p>
                    You can still cancel, but your time will not be
                    automatically refunded.
                  </p>
                  <p>
                    (You needed to cancel{" "}
                    {Reservation.rules.refundCutoffHours.toString()} hours
                    before the start of your reservation, which was at{" "}
                    {cancelationApprovalCutoffString}.)
                  </p>
                  <p>
                    You can send a message to the administrator using the text
                    box below.
                  </p>
                  <Field
                    component={TextField}
                    label="You can type a message here"
                    name="refundMessage"
                    variant="filled"
                    fullWidth
                  />
                </>
              )}
            </DialogContent>
            {autoApprove ? (
              <DialogActions>
                <Button
                  type="submit"
                  color="secondary"
                  variant="contained"
                  disabled={
                    isSubmitting ||
                    Object.values(values.eventIds).every((v) => !v)
                  }
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
                  disabled={
                    isSubmitting ||
                    Object.values(values.eventIds).every((v) => !v)
                  }
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
                  disabled={
                    isSubmitting ||
                    Object.values(values.eventIds).every((v) => !v)
                  }
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
                  disabled={
                    isSubmitting ||
                    Object.values(values.eventIds).every((v) => !v)
                  }
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
