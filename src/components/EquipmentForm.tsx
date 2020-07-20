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
import TuneIcon from "@material-ui/icons/Tune";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import EquipmentList from "./EquipmentList";
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
import EquipmentViewToggleMenu from "./EquipmentViewToggleMenu";
import EquipmentCart from "./EquipmentCart";
import EquipmentStandardList from "./EquipmentStandardList";
import Equipment from "../resources/Equipment";

const EquipmentForm: FunctionComponent<EquipmentFormProps> = ({
  open,
  setOpen,
  selectedEquipment,
  setFieldValue,
  event,
}) => {
  const [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
    setFieldValue,
  });
  const classes = useStyles();
  const quantizedEquipment = quantizeEquipment(
    Equipment.availableItems(state.equipment, event)
  );
  //const quantizedEquipment = quantizeEquipment(state.equipment);
  //console.log(quantizedEquipment);

  const reserveEquipment = (id: number, quantity: number): void => {
    let quantityToReserve = quantity;
    const reservationArray: {
      [k: string]: number;
    } = {};
    //wipe the exiting values
    state.equipment
      .filter((item) => item.modelId === id)
      .forEach((item) =>
        setFieldValue("equipmentReservation[" + item.id + "]", 0)
      );
    while (quantityToReserve > 0) {
      const item = state.equipment
        .filter((item) => !reservationArray[item.id])
        .find((item) => item.modelId === id);
      if (!item) {
        return undefined;
      }
      if (item.quantity >= quantityToReserve) {
        reservationArray[item.id] = quantityToReserve;
        quantityToReserve = 0;
      } else {
        reservationArray[item.id] = item.quantity;
        quantityToReserve = quantityToReserve - item.quantity;
      }
    }
    Object.keys(reservationArray).forEach((item) =>
      setFieldValue(
        "equipmentReservation[" + item + "]",
        reservationArray[item]
      )
    );
  };

  useEffect(() => fetchAllEquipmentResources(dispatch), []);

  const toggleFilterDrawer = (): void =>
    dispatch({ type: EquipmentActionTypes.ToggleFilterDrawer, payload: {} });

  const toggleEquipmentCart = (): void =>
    dispatch({ type: EquipmentActionTypes.ToggleEquipmentCart, payload: {} });
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
        <EquipmentCart
          state={state}
          onOpen={toggleEquipmentCart}
          onClose={toggleEquipmentCart}
          selectedEquipment={selectedEquipment}
          setFieldValue={state.setFieldValue}
        />
        <AppBar position="sticky">
          <List>
            <Toolbar>
              <IconButton
                type="submit"
                edge="start"
                color="inherit"
                aria-label="close"
                onClick={(): void =>
                  state.categoryDrawerView && state.selectedCategory
                    ? dispatch({
                        type: EquipmentActionTypes.SelectLastCategory,
                        payload: {},
                      })
                    : setOpen(false)
                }
              >
                <ArrowBackIosIcon />
              </IconButton>
              {state.categoryDrawerView ? (
                <Typography
                  style={{
                    textTransform: "capitalize",
                  }}
                  className={classes.title}
                >
                  {state.selectedCategory?.title || "All Categories"}
                </Typography>
              ) : (
                <Typography className={classes.title}>Equipment</Typography>
              )}
              <IconButton
                edge="start"
                color="inherit"
                onClick={toggleEquipmentCart}
                aria-label="filter"
              >
                <ShoppingCartIcon />
              </IconButton>
              {(!state.categoryDrawerView || state.selectedCategory) && (
                <IconButton
                  edge="start"
                  color="inherit"
                  onClick={toggleFilterDrawer}
                  aria-label="filter"
                >
                  <TuneIcon />
                </IconButton>
              )}
              <EquipmentViewToggleMenu state={state} dispatch={dispatch} />
            </Toolbar>
          </List>
        </AppBar>
        {(!state.categoryDrawerView || !state.selectedCategory) && (
          <EquipmentList
            reserveEquipment={reserveEquipment}
            dispatch={dispatch}
            state={state}
            equipmentList={filterItems(
              quantizedEquipment,
              state.searchString,
              state.selectedTags,
              null
            )}
            selectedEquipment={selectedEquipment}
          />
        )}
        {state.categoryDrawerView && state.selectedCategory && (
          <EquipmentStandardList
            reserveEquipment={reserveEquipment}
            setFieldValue={state.setFieldValue}
            equipmentList={filterItems(
              quantizedEquipment,
              state.searchString,
              state.selectedTags,
              state.selectedCategory
            )}
            selectedEquipment={selectedEquipment}
          />
        )}
      </div>
    </Dialog>
  );
};

export default EquipmentForm;
