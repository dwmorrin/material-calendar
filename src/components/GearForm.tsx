import React, { FunctionComponent, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  List,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Dialog,
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import FilterDrawer from "./FilterDrawer";
import FilterListIcon from "@material-ui/icons/FilterList";
import GearList from "./GearList";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { makeTransition } from "./Transition";
import Equipment from "../resources/Equipment";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: "white",
    textAlign: "center",
    fontSize: "18px",
  },
}));

const transition = makeTransition("up");

interface GearFormProps {
  gear: Equipment[];
  quantities: {
    [k: string]: number;
  };
  filters: {
    [k: string]: boolean;
  };
  visibleFilters: Set<string>;
  currentCategory: string;
  setFieldValue: (field: string, value: number | string | boolean) => void;
}

const GearForm: FunctionComponent<CalendarUIProps & GearFormProps> = ({
  dispatch,
  state,
  gear,
  quantities,
  filters,
  visibleFilters,
  currentCategory,
  setFieldValue,
}) => {
  // Constant Declarations
  const classes = useStyles();

  // State Declarations
  const [filterDrawerIsOpen, setFilterDrawerIsOpen] = useState(false);
  const [matchAnyFilter, setMatchAnyFilter] = useState(false);
  const [searchString, setSearchString] = useState("");

  // Filtering Function to reduce the size of the gear array being passed down
  function filterItems(
    gear: Equipment[],
    filters: { [k: string]: boolean }
  ): Equipment[] | undefined {
    let queriedGear: Equipment[] = [];
    const activeFilters = Object.keys(filters).filter(function (key: string) {
      return filters[key];
    });
    if (searchString !== "") {
      const queries = searchString.split(",");
      queriedGear = gear.filter(function (gear) {
        return queries.some(function (query) {
          return (
            gear.description
              .toLowerCase()
              .includes(query.toLowerCase().trim()) ||
            gear.tags.some(function (tag) {
              return tag.name
                .toLowerCase()
                .includes(query.toLowerCase().trim());
            })
          );
        });
      });
    } else {
      queriedGear = gear;
    }
    if (matchAnyFilter) {
      return queriedGear.filter(function (gear) {
        return activeFilters.some(function (filter) {
          return gear.tags.some(function (tag) {
            return tag.name.toLowerCase().includes(filter.toLowerCase().trim());
          });
        });
      });
    } else {
      return queriedGear.filter(function (gear) {
        return activeFilters.every(function (filter) {
          return gear.tags.some(function (tag) {
            return tag.name.toLowerCase().includes(filter.toLowerCase().trim());
          });
        });
      });
    }
  }

  // Filter Drawer Toggle Function
  const toggleFilterDrawer = () => (
    event: React.KeyboardEvent | React.MouseEvent
  ): void => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }
    setFilterDrawerIsOpen(!filterDrawerIsOpen);
  };

  return (
    <Dialog
      fullScreen
      open={state.gearFormIsOpen}
      TransitionComponent={transition}
    >
      <div className={classes.root}>
        <div onClick={(): void => setFilterDrawerIsOpen(!filterDrawerIsOpen)}>
          <FilterDrawer
            open={filterDrawerIsOpen}
            onOpen={toggleFilterDrawer}
            onClose={toggleFilterDrawer}
            filters={filters}
            visibleFilters={visibleFilters}
            searchString={searchString}
            setSearchString={setSearchString}
            matchAny={matchAnyFilter}
            setMatchAny={setMatchAnyFilter}
            closeDrawer={() => setFilterDrawerIsOpen(!filterDrawerIsOpen)}
            setFieldValue={setFieldValue}
          />
        </div>
        <AppBar position="sticky">
          <List>
            <Toolbar>
              <IconButton
                type="submit"
                edge="start"
                color="inherit"
                aria-label="close"
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
                onClick={toggleFilterDrawer()}
                aria-label="filter"
              >
                <FilterListIcon />
              </IconButton>
            </Toolbar>
          </List>
        </AppBar>
        <GearList
          gearList={filterItems(gear, filters)}
          currentCategory={currentCategory}
          quantities={quantities}
          setFieldValue={setFieldValue}
        />
      </div>
    </Dialog>
  );
};

export default GearForm;
