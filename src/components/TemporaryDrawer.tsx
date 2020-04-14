import React, { FunctionComponent } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import { ListItemText } from "@material-ui/core";

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
}
const TemporaryDrawer: FunctionComponent<TemporaryDrawerProps> = ({
  open,
  onClose,
  onOpen,
  onClick,
  onKeyDown,
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
          {["Schedule", "Day", "Week", "Month"].map((text) => (
            <ListItem button key={text}>
              <ListItemText primary={text} />
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
