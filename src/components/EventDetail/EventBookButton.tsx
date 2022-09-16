import React, { FC } from "react";
import { Button } from "@material-ui/core";
import Event from "../../resources/Event";

import { useSocket, SocketMessageKind } from "../SocketProvider";

import { Action, CalendarAction } from "../types";

import Reservation from "../../resources/Reservation";
import {
  addHours,
  formatTime,
  isBefore,
  parseSQLDatetime,
} from "../../utils/date";

interface EventBookButtonProps {
  reservationCutoffHasNotPassed: boolean;
  userOwns: boolean;
  open: boolean;
  projectsAvailable: boolean;
  walkInValid: boolean;
  dispatch: (action: Action) => void;
  event: Event;
  hotReservations: Reservation[];
}

// "You can book again at 1:30 pm"
const getCoolDownTime = (hotReservations: Reservation[]): string => {
  // find oldest creation date
  const oldest = hotReservations.reduce((resOld, resCur) =>
    parseSQLDatetime(resOld.created) < parseSQLDatetime(resCur.created)
      ? resOld
      : resCur
  );
  const canBookAgainAt = addHours(
    parseSQLDatetime(oldest.created),
    Number(process.env.REACT_APP_WALK_IN_COOLING_OFF_HOURS || 2)
  );
  // if walk-in time is over when they can book again, don't mislead them
  if (isBefore(canBookAgainAt, Event.walkInDetails().end))
    return "You can book walk-in again at " + formatTime(canBookAgainAt);
  else return "Not available for walk-in";
};

const EventBookButton: FC<EventBookButtonProps> = ({
  reservationCutoffHasNotPassed,
  userOwns,
  open,
  projectsAvailable,
  event,
  walkInValid,
  dispatch,
  hotReservations,
}) => {
  const { broadcast } = useSocket();
  const maxResPerLocationGroup = Number(
    process.env.REACT_APP_WALK_IN_RESERVATIONS_PER_LOCATION || 2
  );
  const hasReachedLimit = hotReservations.length >= maxResPerLocationGroup;

  const disabled =
    hasReachedLimit ||
    event.locked ||
    !(
      reservationCutoffHasNotPassed &&
      (userOwns || (open && projectsAvailable))
    );

  const textFn = (): string => {
    if (event.locked) return "Someone else has the reservation form open";
    if (userOwns) return "Modify your reservation";
    if (walkInValid) return "Reserve Walk-In Time";
    if (hasReachedLimit) return getCoolDownTime(hotReservations);
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
