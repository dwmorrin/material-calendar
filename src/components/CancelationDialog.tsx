import React, { FunctionComponent } from "react";
import { Dialog, Button } from "@material-ui/core";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { useAuth } from "./AuthProvider";
import { makeTransition } from "./Transition";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Reservation from "../resources/Reservation";
import UserGroup from "../resources/UserGroup";
import { sendMail } from "../utils/mail";

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

  const onRequestIrregularGroupSizeApproval = (): void => {
    fetch(`${Reservation.url}/cancel/${state.currentEvent?.reservation?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        refundRequest: 1,
        refundComment: 1,
        userId: user.id,
      }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error || !data) {
          return dispatch({
            type: CalendarAction.Error,
            payload: { error: error || new Error("no data") },
          });
        } else {
          const group = (
            state.resources[ResourceKey.Groups] as UserGroup[]
          ).find(
            (group) => group.id === state.currentEvent?.reservation?.groupId
          );
          const project = (
            state.resources[ResourceKey.Projects] as Project[]
          ).find((project) => project.id === group?.projectId);
          if (group) {
            const subject = "canceled a reservation for your group";
            const body =
              subject +
              " for " +
              project?.title +
              " on " +
              state.currentEvent?.start +
              " in " +
              state.currentEvent?.location.title;
            const refundMessage =
              "requested that project hours be refunded, so a request has been sent to the admin.";
            group.members
              .filter((member) => member.username !== user.username)
              .forEach((member) =>
                sendMail(
                  member.email,
                  user.name.first + " " + user.name.last + " has " + subject,
                  "Hello " +
                    member.name.first +
                    ", " +
                    user.name.first +
                    " " +
                    user.name.last +
                    " has " +
                    body +
                    ". They " +
                    refundMessage,
                  dispatchError
                )
              );
            sendMail(
              user.email,
              "You have " + subject,
              "Hello " +
                user.name.first +
                ",  You have " +
                body +
                ". You " +
                refundMessage,
              dispatchError
            );
            sendMail(
              process.env.REACT_APP_ADMIN_EMAIL || "",
              "Project Hour Refund Request",
              "Hello, " +
                user.name.first +
                " " +
                user.name.last +
                "  is requesting a project hour refund for their booking for" +
                project?.title +
                " in " +
                state.currentEvent?.location.title +
                " on " +
                state.currentEvent?.start,
              dispatchError
            );
          }
        }
      });
  };

  const onCancelWithoutRefund = (): void => {
    fetch(`${Reservation.url}/cancel/${state.currentEvent?.reservation?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
      }),
    })
      .then((response) => response.json())
      .then(({ error, data }) => {
        if (error || !data) {
          return dispatch({
            type: CalendarAction.Error,
            payload: { error: error || new Error("no data") },
          });
        } else {
          const group = (
            state.resources[ResourceKey.Groups] as UserGroup[]
          ).find(
            (group) => group.id === state.currentEvent?.reservation?.groupId
          );
          const project = (
            state.resources[ResourceKey.Projects] as Project[]
          ).find((project) => project.id === group?.projectId);
          if (group) {
            const subject = "canceled a reservation for your group";
            const body =
              subject +
              " for " +
              project?.title +
              " on " +
              state.currentEvent?.start +
              " in " +
              state.currentEvent?.location.title;
            const refundMessage =
              "did not request that project hours be refunded, so the hours have been forfeit.";
            group.members
              .filter((member) => member.username !== user.username)
              .forEach((member) =>
                sendMail(
                  member.email,
                  user.name.first + " " + user.name.last + " has " + subject,
                  "Hello " +
                    member.name.first +
                    ", " +
                    user.name.first +
                    " " +
                    user.name.last +
                    " has " +
                    body +
                    ". They " +
                    refundMessage,
                  dispatchError
                )
              );
            sendMail(
              user.email,
              "You have " + subject,
              "Hello " +
                user.name.first +
                ",  You have " +
                body +
                ". you " +
                refundMessage,
              dispatchError
            );
          }
        }
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
