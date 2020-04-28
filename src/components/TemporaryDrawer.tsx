import React, { FunctionComponent } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import { CalendarAction, CalendarUIProps } from "../calendar/types";
import ResourceList from "./ResourceList";
import ProjectList from "./ProjectList";

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
  },
});

const TemporaryDrawer: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const classes = useStyles();

  const onClose = (): void => {
    // TODO clean up after drawer closes
  };

  const toggleDrawer = (
    event: React.KeyboardEvent | React.MouseEvent | React.SyntheticEvent
  ): void => {
    // For a11y.  Make drawer navigable via keyboard.
    if (
      event &&
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    dispatch({ type: CalendarAction.ToggleDrawer });
  };

  return (
    <SwipeableDrawer
      open={state.drawerIsOpen}
      anchor="left"
      onClose={onClose}
      onOpen={toggleDrawer}
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}
    >
      <div className={clsx(classes.list)} role="presentation">
        <ProjectList dispatch={dispatch} state={state} />
        <ResourceList dispatch={dispatch} state={state} />
      </div>
    </SwipeableDrawer>
  );
};

export default TemporaryDrawer;
