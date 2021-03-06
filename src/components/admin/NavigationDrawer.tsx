import React, { FunctionComponent, Fragment } from "react";
import {
  Drawer,
  Typography,
  List,
  ListItem,
  Accordion,
  AccordionSummary,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { AdminAction, AdminUIProps } from "../../admin/types";
import { ResourceKey } from "../../resources/types";
import Location from "../../resources/Location";
import { enumKeys } from "../../utils/enumKeys";

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
        payload: { error: new Error("unexpected resource click handler") },
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
        payload: { error: new Error("unexpected location click handler") },
        meta: "NAV_DRAWER_CLICK_LOCATION",
      });
    }
    dispatch({
      type: AdminAction.SelectedSchedulerLocation,
      payload: { schedulerLocationId: +event.target.dataset.location },
    });
  };

  return (
    <Drawer
      open={state.drawerIsOpen}
      anchor="left"
      onClose={onClose}
      onClick={toggleDrawer}
      onKeyDown={toggleDrawer}
    >
      <Fragment>
        <Typography variant="h5">
          {process.env.REACT_APP_ADMIN_DRAWER_TITLE}
        </Typography>
        <List>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              onClick={(event): void => event.stopPropagation()}
            >
              Scheduler
            </AccordionSummary>
            {locations.length ? (
              locations.map((location) => (
                <ListItem
                  key={location.id}
                  button
                  onClick={selectSchedulerLocation}
                  data-location={location.id}
                >
                  {location.title}
                </ListItem>
              ))
            ) : (
              <ListItem
                key="newLocationButton"
                button
                data-location={ResourceKey.Locations}
                onClick={(): void =>
                  dispatch({
                    type: AdminAction.SelectedResource,
                    payload: { resourceKey: ResourceKey.Locations },
                  })
                }
              >
                Create a new location
              </ListItem>
            )}
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              onClick={(event): void => event.stopPropagation()}
            >
              Database resources
            </AccordionSummary>
            {enumKeys(ResourceKey).map((key) => (
              <ListItem
                key={key}
                button
                onClick={fetchResource}
                data-resource={key}
              >
                {ResourceKey[key]}
              </ListItem>
            ))}
          </Accordion>
          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              onClick={(event): void => event.stopPropagation()}
            >
              Utilities
            </AccordionSummary>
            <ListItem
              button
              onClick={(): void => dispatch({ type: AdminAction.OpenBackups })}
            >
              Backups
            </ListItem>
          </Accordion>
        </List>
      </Fragment>
    </Drawer>
  );
};

export default AdminNavigationDrawer;
