import React, { FunctionComponent } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import { ListItemText } from "@material-ui/core";
import {
  CalendarAction,
  CalendarView,
  CalendarUIProps,
} from "../calendar/types";
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
        <List>
          {[
            ["Schedule", "listWeek"],
            ["Day", "resourceTimeGridDay"],
            ["Week", "resourceTimeGridWeek"],
            ["Month", "dayGridMonth"],
          ].map((tuple) => (
            <ListItem
              button
              key={tuple[0]}
              onClick={(): void =>
                dispatch({
                  type: CalendarAction.ChangedView,
                  payload: { currentView: tuple[1] as CalendarView },
                })
              }
            >
              <ListItemText primary={tuple[0]} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <ProjectList dispatch={dispatch} state={state} />
        <Divider />
        <ResourceList dispatch={dispatch} state={state} />
      </div>
    </SwipeableDrawer>
  );
};

export default TemporaryDrawer;
