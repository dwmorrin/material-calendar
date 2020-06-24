import React, { FunctionComponent, useEffect } from "react";
import {
  List,
  AppBar,
  Button,
  Toolbar,
  IconButton,
  Typography,
  Dialog,
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import FilterDrawer from "./FilterDrawerAlt";
import CategoryDrawer from "./CategoryDrawer";
import TuneIcon from "@material-ui/icons/Tune";
import EquipmentList from "./EquipmentListAlt";
import {
  fetchAllEquipmentResources,
  filterItems,
  quantizeEquipment,
  transition,
  useStyles,
} from "../equipmentForm/equipmentForm";
import {
  EquipmentFormProps,
  EquipmentActionTypes,
} from "../equipmentForm/types";
import reducer, { initialState } from "../equipmentForm/reducer";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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

  const toggleCategoryDrawer = (): void =>
    dispatch({ type: EquipmentActionTypes.ToggleCategoryDrawer, payload: {} });
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
              <Button
                className={classes.title}
                endIcon={<ExpandMoreIcon />}
                onClick={toggleCategoryDrawer}
              >
                <Typography component="h6">
                  {state.currentCategory?.title || "All Categories"}
                </Typography>
              </Button>

              <IconButton
                edge="start"
                color="inherit"
                onClick={toggleFilterDrawer}
                aria-label="filter"
              >
                <TuneIcon />
              </IconButton>
            </Toolbar>
          </List>
        </AppBar>
        <CategoryDrawer
          state={state}
          dispatch={dispatch}
          onOpen={toggleCategoryDrawer}
          onClose={toggleCategoryDrawer}
        />
        <EquipmentList
          dispatch={dispatch}
          state={state}
          equipmentList={filterItems(
            quantizedEquipment,
            state.searchString,
            state.selectedTags,
            state.currentCategory
          )}
          selectedEquipment={selectedEquipment}
        />
      </div>
    </Dialog>
  );
};

export default EquipmentForm;
