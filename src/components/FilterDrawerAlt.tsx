import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import List from "@material-ui/core/List";
import TextField from "@material-ui/core/TextField";
import FilterList from "./FilterListAlt";
import {
  EquipmentAction,
  EquipmentState,
  EquipmentActionTypes,
} from "../equipmentForm/types";

const useStyles = makeStyles({
  list: {
    width: 250,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    textAlign: "center",
  },
});

interface FilterDrawerProps {
  state: EquipmentState;
  dispatch: (action: EquipmentAction) => void;
  onClose: () => void;
  onOpen: () => void;
  closeDrawer: () => void;
}
const FilterDrawer: FunctionComponent<FilterDrawerProps> = ({
  state,
  dispatch,
  onClose,
  onOpen,
  closeDrawer,
}) => {
  const classes = useStyles();
  // Still need to add X to clear textbox and close drawer on enter
  return (
    <SwipeableDrawer
      open={state.filterDrawerIsOpen}
      anchor="right"
      onClose={onClose}
      onOpen={onOpen}
    >
      <List className={classes.list}>
        <TextField
          size="small"
          id="equipmentSearch"
          label="Search"
          value={state.searchString}
          onChange={(event): void => {
            event.stopPropagation();
            dispatch({
              type: EquipmentActionTypes.ChangedSearchString,
              payload: { searchString: event.target.value },
            });
          }}
          onClick={(event): void => {
            event.stopPropagation();
          }}
          onKeyPress={(ev): void => {
            if (ev.key === "Enter") {
              closeDrawer();
              ev.preventDefault();
            }
          }}
          variant="outlined"
        />

        <FilterList state={state} dispatch={dispatch} />
      </List>
    </SwipeableDrawer>
  );
};

export default FilterDrawer;
