import React, { FunctionComponent, useState } from "react";
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
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const classes = useStyles();
  const initialFilters = [
    {
      name: "",
      toggle: false
    }
  ];
  const [array, setArray] = useState(initialFilters);
  const gear = Database.gear;

  const checkExists = (tag: string) => (tag: string): boolean => {
    let hasMatch = false;
    for (let index = 0; index < array.length; ++index) {
      if ((array[index].name = tag)) {
        hasMatch = true;
      }
    }
    return hasMatch;
  };

  const AddToArray = (tag: string) => (tag: string): void => {
    console.log("tag is " + tag);
    console.log("is this working");
    const tempArray = array;
    const filter = {
      name: tag,
      toggle: false
    };
    tempArray.push(filter);
    console.log(tempArray);
    setArray(tempArray);
  };

  // something needs to be done here to go through the list of tags and put
  // them in a new JSON array in the format {name: string; toggle: boolean;}
  const filters = Database.gear
    .filter((item) => checkExists(item.tags))
    .map((item) => AddToArray(item.tags));

  console.log(filters);

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
          items={gear}
          //filters={filters}
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
