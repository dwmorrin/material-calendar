import React, { FunctionComponent, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  List,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Dialog
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import FilterDrawer from "./FilterDrawer";
import FilterListIcon from "@material-ui/icons/FilterList";
import GearList from "./GearList";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { makeTransition } from "./Transition";
import Gear from "../resources/Gear";
import Filter from "../resources/Filter";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    flexGrow: 1,
    color: "white",
    textAlign: "center",
    fontSize: "18px"
  }
}));

const transition = makeTransition("up");

interface GearFormProps {
  gear: Gear[];
  quantities: {
    [k: string]: number;
  };
  filters: {
    [k: string]: boolean;
  };
  visibleFilters: {
    [k: string]: boolean;
  };
  selectedGroup: string;
  changeCurrentGroup: (group: string) => void;
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T = string | React.ChangeEvent<any>>(
      field: T
    ): T extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
}

const GearForm: FunctionComponent<CalendarUIProps & GearFormProps> = ({
  dispatch,
  state,
  gear,
  quantities,
  filters,
  visibleFilters,
  handleChange,
  selectedGroup,
  changeCurrentGroup
}) => {
  const [drawerIsOpen, setDrawerIsOpen] = useState(false);
  const [matchAny, setMatchAny] = useState(false);
  const classes = useStyles();
  const [searchString, setSearchString] = useState("");

  function filterItems(
    gear: Gear[],
    filters: { [k: string]: boolean }
  ): Gear[] | undefined {
    let queriedGear: Gear[] = [];
    const activeFilters = Object.keys(filters).filter(function (key: string) {
      return filters[key];
    });
    if (searchString !== "") {
      const queries = searchString.split(",");
      queriedGear = gear.filter(function (gear) {
        return queries.some(function (query) {
          return (
            gear.title.toLowerCase().includes(query.toLowerCase().trim()) ||
            gear.tags.toLowerCase().includes(query.toLowerCase().trim())
          );
        });
      });
    } else {
      queriedGear = gear;
    }
    if (matchAny) {
      return queriedGear.filter(function (gear) {
        return activeFilters.some(function (filter) {
          return gear.tags.toLowerCase().includes(filter.toLowerCase());
        });
      });
    } else {
      return queriedGear.filter(function (gear) {
        return activeFilters.every(function (filter) {
          return gear.tags.toLowerCase().includes(filter.toLowerCase());
        });
      });
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
    <Dialog
      fullScreen
      open={state.gearFormIsOpen}
      TransitionComponent={transition}
    >
      <div className={classes.root}>
        <div onClick={(): void => setDrawerIsOpen(!drawerIsOpen)}>
          <FilterDrawer
            open={drawerIsOpen}
            onOpen={toggleDrawer}
            onClose={toggleDrawer}
            items={gear}
            filters={filters}
            visibleFilters={visibleFilters}
            searchString={searchString}
            setSearchString={setSearchString}
            matchAny={matchAny}
            setMatchAny={setMatchAny}
            closeDrawer={() => setDrawerIsOpen(!drawerIsOpen)}
            handleChange={handleChange}
          />
        </div>
        <AppBar position="sticky">
          <List>
            <Toolbar>
              <IconButton
                type="submit"
                edge="start"
                color="inherit"
                aria-label="close1"
                onClick={(): void =>
                  dispatch({ type: CalendarAction.CloseGearForm })
                }
              >
                <ArrowBackIosIcon />
              </IconButton>
              <Typography className={classes.title}>GEAR</Typography>
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
          gearList={filterItems(gear, filters)}
          selectedGroup={selectedGroup}
          changeCurrentGroup={changeCurrentGroup}
          quantities={quantities}
          handleChange={handleChange}
        />
      </div>
    </Dialog>
  );
};

export default GearForm;
