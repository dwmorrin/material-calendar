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
  const viewFilters: {
    name: string;
    toggle: boolean;
  }[] = [];
  const [filters, setFilters] = useState(initialFilters);
  const [searchString, setSearchString] = useState("");

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
      toggle: false
    };
    tempArray.push(filter);
    setFilters(tempArray);
  }

  function checkViewExists(tag: string): boolean {
    let hasMatch = false;
    for (let index = 0; index < viewFilters.length; ++index) {
      if (viewFilters[index].name === tag) {
        hasMatch = true;
      }
    }
    return hasMatch;
  }

  function pushViewArray(tag: string): void {
    const viewArray = viewFilters;
    const filter = filters.find(function (filter) {
      return filter.name === tag;
    });
    if (filter) {
      viewArray.push(filter);
    }
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
    }[],
    filters: {
      name: string;
      toggle: boolean;
    }[],
    search: string
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
    const activeFilters = filters.filter(function (filter) {
      return filter.toggle;
    });
    if (searchString === "") {
      for (let i = 0; i < gear.length; ++i) {
        let hasMatch = false;
        if (
          activeFilters.every(function (filter) {
            return gear[i].tags
              .toLowerCase()
              .includes(filter.name.toLowerCase());
          })
        ) {
          hasMatch = true;
        }
        if (hasMatch) {
          tempArray.push(gear[i]);
        }
      }
    } else {
      for (let i = 0; i < gear.length; ++i) {
        if (
          gear[i].title.toLowerCase().includes(searchString.toLowerCase()) ||
          gear[i].tags.toLowerCase().includes(searchString.toLowerCase())
        ) {
          tempArray.push(gear[i]);
        }
      }
    }
    if (activeFilters.length == 0) {
      return gear;
    } else {
      return tempArray;
    }
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

  const [selectedGroup, setSelectedGroup] = useState("");
  const changeCurrentGroup = (group: string): void => {
    if (group === selectedGroup) {
      setSelectedGroup("");
    } else {
      setSelectedGroup(group);
    }
  };

  // Create full list of filters
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
  // Create list of applicable filters
  for (let index = 0; index < Database.gear.length; ++index) {
    const item = gear[index];
    if (item.parentId === selectedGroup) {
      const tags = item.tags.split(",");
      for (let i = 0; i < tags.length; ++i) {
        const tag = cleanTag(tags[i]);
        if (!checkViewExists(tag)) {
          pushViewArray(tag);
        }
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
          filters={sortFilters(viewFilters)}
          toggleFunction={toggleFilter}
          searchString={searchString}
          setSearchString={setSearchString}
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
            <IconButton
              edge="start"
              color="inherit"
              onClick={toggleDrawer()}
              aria-label="search"
            >
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
      <GearList
        gearList={filterItems(gear, filters, searchString)}
        selectedGroup={selectedGroup}
        changeCurrentGroup={changeCurrentGroup}
      />
    </div>
  );
};

export default GearForm;
