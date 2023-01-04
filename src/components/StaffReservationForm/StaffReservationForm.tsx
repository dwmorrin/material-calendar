import React, { FC } from "react";
import { CalendarUIProps, CalendarAction } from "../types";
import { Dialog, DialogTitle, IconButton, Toolbar } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const StaffReservationForm: FC<CalendarUIProps> = ({ dispatch, state }) => (
  <Dialog open={state.staffReservationFormIsOpen}>
    <Toolbar>
      <IconButton
        edge="start"
        color="inherit"
        aria-label="close"
        onClick={(): void =>
          dispatch({ type: CalendarAction.CloseStaffReservationForm })
        }
      >
        <CloseIcon />
      </IconButton>
      <DialogTitle>Staff Reservation Form</DialogTitle>
    </Toolbar>
    Manage check-in/check-out and equipment here.
  </Dialog>
);

export default StaffReservationForm;
