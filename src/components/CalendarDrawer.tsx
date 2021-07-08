import React, { FunctionComponent } from "react";
import { SwipeableDrawer, Typography } from "@material-ui/core";
import {
  CalendarAction,
  CalendarUIProps,
  CalendarUISelectionProps,
} from "../calendar/types";
import LocationList from "./LocationList";
import ProjectList from "./ProjectList";

const CalendarDrawer: FunctionComponent<
  CalendarUIProps & CalendarUISelectionProps
> = ({ dispatch, state, selections, setSelections }) => {
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
      open={!selections.locationIds.length || state.drawerIsOpen}
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
        <ProjectList
          dispatch={dispatch}
          state={state}
          selections={selections}
          setSelections={setSelections}
        />
        <Typography variant="body1">Rooms</Typography>
        <LocationList
          dispatch={dispatch}
          state={state}
          selections={selections}
          setSelections={setSelections}
        />
      </div>
    </SwipeableDrawer>
  );
};

export default CalendarDrawer;
