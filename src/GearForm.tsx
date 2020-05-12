import React, { FunctionComponent, useEffect, useState, useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  List,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button
} from "@material-ui/core";

import CloseIcon from "@material-ui/icons/Close";
import { RouteComponentProps } from "@reach/router";

import FilterDrawer from "./FilterDrawer";

import Database from "./Database.js";
import FilterListIcon from "@material-ui/icons/FilterList";
import SearchIcon from "@material-ui/icons/Search";
import GearList from "./GearList";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
    color: "white"
  }
}));

const GearForm: FunctionComponent<RouteComponentProps> = () => {
  const [pickerShowing, setPickerShowing] = useState(false);
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const classes = useStyles();
  const locations = Database.locations;
  const gear = Database.gear;

  const toggleDrawer = () => (
    event: React.KeyboardEvent | React.MouseEvent
  ): void => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setDrawerIsOpen(!drawerIsOpen);
  };

  return (
    <div className={classes.root}>
      <div onClick={(): void => setDrawerIsOpen(!drawerIsOpen)}>
        <FilterDrawer
          open={drawerIsOpen}
          onOpen={toggleDrawer}
          onClose={toggleDrawer}
          panelType={"checkboxes"}
          drawerContents={locations}
        />
      </div>
      <AppBar position="sticky">
        <List>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="exit">
              <CloseIcon />
            </IconButton>
            <Button className={classes.title}>
              <Typography component="h6">Gear</Typography>
            </Button>
            {/* <IconButton color="inherit" onClick={handleClickToday}>
              <TodayIcon />
            </IconButton> */}
            <IconButton edge="start" color="inherit" aria-label="search">
              <SearchIcon />
            </IconButton>
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer()}
              aria-label="filter"
            >
              <FilterListIcon />
            </IconButton>
          </Toolbar>
        </List>
      </AppBar>
      <GearList gearList={gear} />
    </div>
  );
};

export default GearForm;
