import React, { FunctionComponent } from "react";
import {
  Dialog,
  Toolbar,
  IconButton,
  Typography,
  Paper,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { makeTransition } from "./Transition";

const transition = makeTransition("right");

const GroupDashboard: FunctionComponent<CalendarUIProps> = ({
  state,
  dispatch,
}) => {
  return (
    <Dialog
      fullScreen
      TransitionComponent={transition}
      open={state.groupDashboardIsOpen}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: CalendarAction.CloseGroupDashboard })
          }
        >
          <CloseIcon />
        </IconButton>
        <Typography>Group Dashboard</Typography>
      </Toolbar>
      <Paper
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <section>
          <Typography variant="body2">Maybe dates?</Typography>
        </section>
      </Paper>
    </Dialog>
  );
};

export default GroupDashboard;
