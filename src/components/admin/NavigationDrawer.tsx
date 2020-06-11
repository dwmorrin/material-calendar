import React, { FunctionComponent } from "react";
import { SwipeableDrawer, Typography, List, ListItem } from "@material-ui/core";
import { AdminAction, AdminUIProps } from "../../admin/types";
import { ResourceKey } from "../../resources/types";
import Location from "../../resources/Location";

const AdminNavigationDrawer: FunctionComponent<AdminUIProps> = ({
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
    dispatch({ type: AdminAction.ToggleDrawer });
  };

  /**
   * resources are selected by user interaction on a list of available
   * resources.  Each list item has a data-resource property that contains
   * a ResourceKey.
   * @param event
   */
  const fetchResource = (
    event: React.KeyboardEvent | React.MouseEvent | React.SyntheticEvent
  ): void => {
    if (
      !(event.target instanceof HTMLElement) ||
      !event.target.dataset.resource
    ) {
      return dispatch({
        type: AdminAction.Error,
        payload: { error: { message: "unexpected resource click handler" } },
        meta: "NAV_DRAWER_CLICK_RESOURCE",
      });
    }
    dispatch({
      type: AdminAction.SelectedResource,
      payload: { resourceKey: +event.target.dataset.resource },
    });
  };
  const locations = state.resources[ResourceKey.Locations] as Location[];

  const selectSchedulerLocation = (
    event: React.KeyboardEvent | React.MouseEvent | React.SyntheticEvent
  ): void => {
    if (
      !(event.target instanceof HTMLElement) ||
      !event.target.dataset.location
    ) {
      return dispatch({
        type: AdminAction.Error,
        payload: { error: { message: "unexpected location click handler" } },
        meta: "NAV_DRAWER_CLICK_LOCATION",
      });
    }
    dispatch({
      type: AdminAction.SelectedSchedulerLocation,
      payload: { schedulerLocationId: +event.target.dataset.location },
    });
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
          {process.env.REACT_APP_ADMIN_DRAWER_TITLE}
        </Typography>
        <List>
          <ListItem
            button
            onClick={(): void => dispatch({ type: AdminAction.OpenScheduler })}
          >
            Scheduler Calendar
          </ListItem>
          {locations.map((location) => (
            <ListItem
              key={location.id}
              button
              onClick={selectSchedulerLocation}
              data-location={location.id}
            >{`- ${location.title}`}</ListItem>
          ))}
          <ListItem
            button
            onClick={fetchResource}
            data-resource={ResourceKey.Users}
          >
            Users
          </ListItem>
          <ListItem
            button
            onClick={fetchResource}
            data-resource={ResourceKey.Groups}
          >
            - Groups
          </ListItem>
          <ListItem
            button
            onClick={fetchResource}
            data-resource={ResourceKey.Locations}
          >
            Locations
          </ListItem>
          <ListItem
            button
            onClick={fetchResource}
            data-resource={ResourceKey.Projects}
          >
            Projects
          </ListItem>
          <ListItem
            button
            onClick={fetchResource}
            data-resource={ResourceKey.Courses}
          >
            - Courses
          </ListItem>
          <ListItem
            button
            onClick={fetchResource}
            data-resource={ResourceKey.Events}
          >
            Events
          </ListItem>
          <ListItem
            button
            onClick={fetchResource}
            data-resource={ResourceKey.Reservations}
          >
            Reservations
          </ListItem>
          <ListItem
            button
            onClick={fetchResource}
            data-resource={ResourceKey.Equipment}
          >
            Equipment
          </ListItem>
          <ListItem
            button
            onClick={fetchResource}
            data-resource={ResourceKey.Categories}
          >
            - Categories
          </ListItem>
          <ListItem
            button
            onClick={fetchResource}
            data-resource={ResourceKey.Tags}
          >
            - Tags
          </ListItem>
        </List>
      </div>
    </SwipeableDrawer>
  );
};

export default AdminNavigationDrawer;
