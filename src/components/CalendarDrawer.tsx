import React, { FunctionComponent } from "react";
import {
  Grid,
  List,
  ListItem,
  SwipeableDrawer,
  Typography,
} from "@material-ui/core";
import {
  CalendarAction,
  CalendarUIProps,
  CalendarUISelectionProps,
} from "../calendar/types";
import LocationList from "./LocationList";
import ProjectList from "./ProjectList";
import Location from "../resources/Location";
import UserGroup from "../resources/UserGroup";
import { ResourceKey } from "../resources/types";

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
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const invitations = groups.filter(({ pending }) => pending);
  const locations = state.resources[ResourceKey.Locations] as Location[];

  return (
    <SwipeableDrawer
      open={
        !selections.locationIds.some((id) =>
          locations.find((l) => l.id === id)
        ) || state.drawerIsOpen
      }
      anchor="left"
      onClose={onClose}
      onOpen={toggleDrawer}
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}
    >
      <List role="navigation">
        <Grid container justify="space-between">
          <Grid item xs={10}>
            <Typography variant="h5">
              {process.env.REACT_APP_DRAWER_TITLE}
            </Typography>
          </Grid>
        </Grid>
        <ProjectList
          dispatch={dispatch}
          invitations={invitations}
          state={state}
          selections={selections}
          setSelections={setSelections}
        />
        <ListItem>
          <Typography variant="body1">Rooms</Typography>
        </ListItem>
        <LocationList
          dispatch={dispatch}
          state={state}
          selections={selections}
          setSelections={setSelections}
        />
      </List>
    </SwipeableDrawer>
  );
};

export default CalendarDrawer;
