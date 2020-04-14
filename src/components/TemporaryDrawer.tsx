import React, { FunctionComponent } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import { ListItemText } from "@material-ui/core";
import {
  Action,
  CalendarAction,
  CalendarState,
  CalendarView,
} from "../calendar/types";

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: "auto",
  },
});

interface TemporaryDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  onClick: () => void;
  onKeyDown: () => void;
  dispatch: (action: Action) => void;
  state: CalendarState;
}
const TemporaryDrawer: FunctionComponent<TemporaryDrawerProps> = ({
  open,
  onClose,
  onOpen,
  onClick,
  onKeyDown,
  dispatch,
  state,
}) => {
  const classes = useStyles();

  return (
    <SwipeableDrawer
      open={open}
      anchor="left"
      onClose={onClose}
      onOpen={onOpen}
      onClick={onClick}
      onKeyDown={onKeyDown}
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
        <List>
          {["Studio 1", "Studio 2"].map((text) => (
            <ListItem button key={text}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </div>
    </SwipeableDrawer>
  );
};

export default TemporaryDrawer;
