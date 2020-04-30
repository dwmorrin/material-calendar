import React, { FunctionComponent } from "react";
import { SwipeableDrawer, Typography } from "@material-ui/core";
import { CalendarAction, CalendarUIProps } from "../calendar/types";
import ResourceList from "./ResourceList";
import ProjectList from "./ProjectList";

const TemporaryDrawer: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
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
      <div role="navigation">
        <Typography variant="h5">
          {process.env.REACT_APP_DRAWER_TITLE}
        </Typography>
        <ProjectList dispatch={dispatch} state={state} />
        <Typography variant="body1">Rooms</Typography>
        <ResourceList dispatch={dispatch} state={state} />
      </div>
    </SwipeableDrawer>
  );
};

export default TemporaryDrawer;
