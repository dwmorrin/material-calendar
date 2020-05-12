import React, { FunctionComponent } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import { navigate } from "@reach/router";

const useStyles = makeStyles({
  list: {
    width: 250
  },
  fullList: {
    width: "auto"
  }
});

function submitHandler(navigateTo: string): void {
  navigate(navigateTo);
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
  drawerContents: { id: string; parentId: string; title: string }[];
  panelType: "checkboxes" | "buttons";
}
const FilterDrawer: FunctionComponent<FilterDrawerProps> = ({
  open,
  onClose,
  onOpen
}) => {
  const classes = useStyles();
  return (
    <SwipeableDrawer
      open={open}
      anchor="right"
      onClose={onClose}
      onOpen={onOpen}
    >
      <div className={clsx(classes.list)} role="presentation">
        <List></List>
      </div>
    </SwipeableDrawer>
  );
};

export default FilterDrawer;
