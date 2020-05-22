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
  visibleFilters: Set<string>;
  selectedCategory: string;
  changeCurrentCategory: (group: string) => void;
  changeQuantity: (field: string, value: any) => void;
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
  selectedCategory,
  changeCurrentCategory,
  changeQuantity
}) => {
  // Constant Declarations
  const classes = useStyles();

  // State Declarations
  const [filterDrawerIsOpen, setFilterDrawerIsOpen] = useState(false);
  const [matchAnyFilter, setMatchAnyFilter] = useState(false);
  const [searchString, setSearchString] = useState("");

  // Filtering Function to reduce the size of the gear array being passed down
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
    if (matchAnyFilter) {
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
          selectedCategory={selectedCategory}
          changeCurrentCategory={changeCurrentCategory}
          quantities={quantities}
          changeQuantity={changeQuantity}
        />
      </div>
    </Dialog>
  );
};

export default GearForm;
