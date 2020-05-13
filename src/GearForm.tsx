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

const initialFilters = [
  {
    name: "",
    toggle: false
  }
];

const GearForm: FunctionComponent<RouteComponentProps> = () => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const classes = useStyles();
  const gear = Database.gear;
  const [array, setArray] = useState(initialFilters);

  function checkExists(tags: string): boolean {
    let hasMatch = false;
    for (let index = 0; index < array.length; ++index) {
      if (array[index].name == tags) {
        hasMatch = true;
      }
    }
    return hasMatch;
  }

  function pushArray(tags: string): void {
    const tempArray = array;
    const filter = {
      name: tags,
      toggle: false
    };
    tempArray.push(filter);
    setArray(tempArray);
  }

  // something needs to be done here to go through the list of tags and put
  // them in a new JSON array in the format {name: string; toggle: boolean;}

  for (let index = 0; index < Database.gear.length; ++index) {
    const item = gear[index];
    if (!checkExists(item.tags)) {
      pushArray(item.tags);
    }
  }
  console.log(array);

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
