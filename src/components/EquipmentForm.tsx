import React, { FunctionComponent, useEffect } from "react";
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
import {
  fetchAllEquipmentResources,
  filterEquipment,
  quantizeEquipment,
  queryEquipment,
  transition,
  useStyles,
} from "../calendar/equipmentForm";
import {
  EquipmentFormProps,
  EquipmentActionTypes,
} from "../equipmentForm/types";
import reducer, { initialState } from "../equipmentForm/reducer";

const EquipmentForm: FunctionComponent<EquipmentFormProps> = ({
  open,
  setOpen,
  selectedEquipment,
  setFieldValue,
}) => {
  const [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
    setFieldValue,
  });
  const classes = useStyles();
  const quantizedEquipment = quantizeEquipment(state.equipment);

  useEffect(() => fetchAllEquipmentResources(dispatch), []);

  const toggleFilterDrawer = (): void =>
    dispatch({ type: EquipmentActionTypes.ToggleFilterDrawer, payload: {} });

  return (
    <Dialog fullScreen open={open} TransitionComponent={transition}>
      <div className={classes.root}>
        <FilterDrawer
          state={state}
          dispatch={dispatch}
          onOpen={toggleFilterDrawer}
          onClose={toggleFilterDrawer}
          closeDrawer={toggleFilterDrawer}
        />
        <AppBar position="sticky">
          <List>
            <Toolbar>
              <IconButton
                type="submit"
                edge="start"
                color="inherit"
                aria-label="close"
                onClick={(): void => setOpen(false)}
              >
                <ArrowBackIosIcon />
              </IconButton>
              <Typography className={classes.title}>Equipment</Typography>
              <IconButton
                edge="start"
                color="inherit"
                onClick={toggleFilterDrawer}
                aria-label="filter"
              >
                <FilterListIcon />
              </IconButton>
            </Toolbar>
          </List>
        </AppBar>
        <EquipmentList
          equipmentList={filterEquipment(
            queryEquipment(quantizedEquipment, state.searchString),
            state.filters
          )}
          currentCategory={state.currentCategory}
          selectedEquipment={selectedEquipment}
          setFieldValue={setFieldValue}
        />
      </div>
    </Dialog>
  );
};

export default EquipmentForm;
