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
import EquipmentList from "./EquipmentList";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { makeTransition } from "./Transition";
import Equipment from "../resources/Equipment";
import { queryEquipment, filterEquipment } from "../utils/equipment";

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

interface EquipmentFormProps {
  equipment: Equipment[];
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

const EquipmentForm: FunctionComponent<
  CalendarUIProps & EquipmentFormProps
> = ({
  dispatch,
  state,
  equipment,
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
  const [searchString, setSearchString] = useState("");

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
      open={state.equipmentFormIsOpen}
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
            closeDrawer={(): void => setFilterDrawerIsOpen(!filterDrawerIsOpen)}
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
                  dispatch({ type: CalendarAction.CloseEquipmentForm })
                }
              >
                <ArrowBackIosIcon />
              </IconButton>
              <Typography className={classes.title}>Equipment</Typography>
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
        <EquipmentList
          equipmentList={filterEquipment(queryEquipment(equipment, searchString), filters)}
          currentCategory={currentCategory}
          quantities={quantities}
          setFieldValue={setFieldValue}
        />
      </div>
    </Dialog>
  );
};

export default EquipmentForm;
