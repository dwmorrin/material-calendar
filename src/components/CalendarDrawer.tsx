import React, { FunctionComponent } from "react";
import { SwipeableDrawer, Typography } from "@material-ui/core";
import {
  CalendarAction,
  CalendarUIProps,
  CalendarUISelectionProps,
} from "../calendar/types";
import LocationList from "./LocationList";
import ProjectList from "./ProjectList";
import { useAuth } from "./AuthProvider";
import Location from "../resources/Location";
import { ResourceKey } from "../resources/types";
import { getUnansweredInvitations } from "../resources/Invitation";

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
  const { user } = useAuth();
  const unansweredInvitations = getUnansweredInvitations(
    user,
    state.invitations
  );
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
      <div role="navigation">
        <Typography variant="h5">
          {process.env.REACT_APP_DRAWER_TITLE}
        </Typography>
        {unansweredInvitations.filter(
          (invitation) => invitation.invitor.id !== user?.id
        ).length > 0 && (
          <Typography variant="h6">
            {"You have unanswered invitations"}
          </Typography>
        )}
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
