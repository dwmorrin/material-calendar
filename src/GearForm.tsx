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
  const [filters, setFilters] = useState(initialFilters);

  function checkExists(tag: string): boolean {
    let hasMatch = false;
    for (let index = 0; index < filters.length; ++index) {
      if (filters[index].name === tag) {
        hasMatch = true;
      }
    }
    return hasMatch;
  }

  function pushArray(tag: string): void {
    const tempArray = filters;
    const filter = {
      name: tag,
      toggle: true
    };
    tempArray.push(filter);
    setFilters(tempArray);
  }

  function cleanTag(tag: string): string {
    tag = tag.trim();
    const words = tag.split(" ");
    tag = "";
    for (let index = 0; index < words.length; ++index) {
      const word = words[index].charAt(0).toUpperCase() + words[index].slice(1);
      tag = tag + word + " ";
    }
    return tag.trim();
  }

  function filterItems(
    gear: {
      id: string;
      parentId: string;
      title: string;
      tags: string;
    }[]
  ):
    | {
        id: string;
        parentId: string;
        title: string;
        tags: string;
      }[]
    | undefined {
    const tempArray: {
      id: string;
      parentId: string;
      title: string;
      tags: string;
    }[] = [];
    // do some stuff in here to write to the tempArray to only
    // gear that contain the items matching ids

    // loop through the list of gear
    // split the gear tags and compare to those
    // that are true in filters[]
    // return true if gear tag contains one of the tags
    // let activefilters= filters where toggle=true
    for (let i = 0; i < gear.length; ++i) {
      let hasMatch = false;
      const tags = gear[i].tags.split(",");
      for (let x = 0; x < tags.length; ++x) {
        const tag = cleanTag(tags[x]);
        for (let index = 0; index < filters.length; ++index) {
          if (filters[index].toggle === true) {
            if (tag.toLowerCase() == filters[index].name.toLowerCase()) {
              hasMatch = true;
            }
          }
        }
      }
      if (hasMatch) {
        tempArray.push(gear[i]);
      }
    }
    return tempArray;
  }

  const toggleFilter = (filter: { name: string; toggle: boolean }): void => {
    filter.toggle = !filter.toggle;
    const tempArray = [];
    for (let index = 0; index < filters.length; ++index) {
      if (filters[index].name == filter.name) {
        tempArray.push(filter);
      } else {
        tempArray.push(filters[index]);
      }
    }
    setFilters(tempArray);
  };

  function sortFilters(
    filters: {
      name: string;
      toggle: boolean;
    }[]
  ): {
    name: string;
    toggle: boolean;
  }[] {
    filters.sort(function (a, b) {
      if (a.name == "") {
        return -1;
      } else if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
    return filters;
  }

  // something needs to be done here to go through the list of tags and put
  // them in a new JSON array in the format {name: string; toggle: boolean;}

  for (let index = 0; index < Database.gear.length; ++index) {
    const item = gear[index];
    const tags = item.tags.split(",");
    for (let i = 0; i < tags.length; ++i) {
      const tag = cleanTag(tags[i]);
      if (!checkExists(tag)) {
        pushArray(tag);
      }
    }
  }

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
          filters={sortFilters(filters)}
          toggleFunction={toggleFilter}
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
      <GearList gearList={filterItems(gear)} />
    </div>
  );
};

export default GearForm;
