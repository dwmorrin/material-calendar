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
import Reservation from "../resources/Reservation";
import Event from "../resources/Event";
import {
  formatDatetime,
  parseAndFormatSQLDatetimeInterval,
} from "../utils/date";
import { SocketMessageKind, ReservationChangePayload } from "./SocketProvider";
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
  isWalkIn: boolean;
  subEvents: Event[];
}

const CancelationDialog: FunctionComponent<CancelationDialogProps> = ({
  broadcast,
  dispatch,
  state,
  open,
  setOpen,
  isWalkIn,
  subEvents,
}) => {
  const dispatchError = (error: Error, meta?: unknown): void => {
    setOpen(false);
    dispatch({ type: CalendarAction.Error, payload: { error }, meta });
  };
  const { isAdmin } = useAuth();

  const { currentEvent } = state;
  if (!currentEvent) return null;

  const autoApprove = subEvents.every(Event.canAutoRefund);

  const onCancelationRequest = (values: FormValues): void => {
    const { refundRequested, refundMessage: message } = values;
    const selectedEvents: Event[] = Object.entries(values.eventIds).reduce(
      (ids, [id, selected]) =>
        selected
          ? [...ids, subEvents.find((e) => e.id === +id) || new Event()]
          : ids,
      [] as Event[]
    );

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

        // send reservation info to currently connected users
        // broadcast(SocketMessageKind.ReservationChanged, {
        //   eventIds,
        //   reservationId: reservation.id,
        //   groupId: group.id,
        //   projectId: project.id,
        // });
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
            (dict, e) => ({ ...dict, [String(e.id)]: Event.canCancel(e) }),
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
                    {subEvents.map((e) => (
                      <ListItem key={`cancel-list-${e.id}`}>
                        <Field
                          Label={{
                            label:
                              parseAndFormatSQLDatetimeInterval({
                                start: e.start,
                                end: e.originalEnd,
                              }) +
                              ": " +
                              (values.eventIds[String(e.id)]
                                ? "YES CANCEL"
                                : "NOT CANCEL"),
                          }}
                          type="checkbox"
                          name={`eventIds[${e.id}]`}
                          component={CheckboxWithLabel}
                          disabled={!(isAdmin || Event.canCancel(e))}
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
                    {subEvents
                      .map((e) => {
                        const approvalCutoff =
                          Event.cancelationApprovalCutoff(e);
                        const cutoffString = approvalCutoff
                          ? formatDatetime(approvalCutoff)
                          : "(Something went wrong)";
                        return `${cutoffString} for ${parseAndFormatSQLDatetimeInterval(
                          e
                        )}`;
                      })
                      .join(", ")}
                    .)
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
