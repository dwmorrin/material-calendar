import React, { FC } from "react";
import { Button } from "@material-ui/core";
import Event from "../../resources/Event";

import { useSocket, SocketMessageKind } from "../SocketProvider";

import { Action, CalendarAction } from "../types";

interface EventBookButtonProps {
  reservationCutoffHasNotPassed: boolean;
  userOwns: boolean;
  open: boolean;
  projectsAvailable: boolean;
  walkInValid: boolean;
  dispatch: (action: Action) => void;
  event: Event;
}

const EventBookButton: FC<EventBookButtonProps> = ({
  reservationCutoffHasNotPassed,
  userOwns,
  open,
  projectsAvailable,
  event,
  walkInValid,
  dispatch,
}) => {
  const { broadcast } = useSocket();

  const disabled =
    event.locked ||
    !(
      reservationCutoffHasNotPassed &&
      (userOwns || (open && projectsAvailable))
    );

  const textFn = (): string => {
    if (event.locked) return "Someone else has the reservation form open";
    if (userOwns) return "Modify your reservation";
    if (walkInValid) return "Reserve Walk-In Time";
    return "Reserve this time";
  };

  return (
    <Button
      disabled={disabled}
      variant="contained"
      color="primary"
      key="MakeReservation"
      onClick={(e): void => {
        e.stopPropagation();
        if (!userOwns) {
          // lock out currently connected users
          broadcast(SocketMessageKind.EventLock, event.id);
          // update database to lock out future users
          fetch(`${Event.url}/${event.id}/lock`, { method: "POST" });
        }
        dispatch({
          type: CalendarAction.OpenReservationForm,
          payload: { currentEvent: event },
        });
      }}
    >
      {textFn()}
    </Button>
  );
};

export default EventBookButton;
