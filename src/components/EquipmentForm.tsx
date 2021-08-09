import React, { FunctionComponent } from "react";
import {
  List,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Dialog,
  Button,
} from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import FilterDrawer from "./FilterDrawer";
import SearchIcon from "@material-ui/icons/Search";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import EquipmentList from "./EquipmentList";
import {
  filterItems,
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
import { useAuth } from "./AuthProvider";

const EquipmentForm: FunctionComponent<EquipmentFormProps> = ({
  open,
  setOpen,
  selectedEquipment,
  setFieldValue,
  categories,
}) => {
  const { user } = useAuth();
  const [state, dispatch] = React.useReducer(reducer, {
    ...initialState,
    setFieldValue,
  });
  const classes = useStyles();

  const toggleFilterDrawer = (): void =>
    dispatch({ type: EquipmentActionTypes.ToggleFilterDrawer, payload: {} });

  const toggleEquipmentCart = (): void =>
    dispatch({ type: EquipmentActionTypes.ToggleEquipmentCart, payload: {} });
  return (
    <Dialog open={open} TransitionComponent={transition}>
      <div className={classes.root}>
        <FilterDrawer
          state={state}
          dispatch={dispatch}
          onOpen={toggleFilterDrawer}
          onClose={toggleFilterDrawer}
          closeDrawer={toggleFilterDrawer}
        />
        {state.equipmentCartIsOpen && (
          <EquipmentCart
            state={state}
            onOpen={toggleEquipmentCart}
            onClose={toggleEquipmentCart}
            selectedEquipment={selectedEquipment}
            setFieldValue={state.setFieldValue}
          />
        )}
        <AppBar position="sticky">
          <List>
            <Toolbar>
              <Button
                type="submit"
                style={{ backgroundColor: "salmon", color: "white" }}
                variant="contained"
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
                Continue with Reservation
              </Button>
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
                  <SearchIcon />
                </IconButton>
              )}
              <EquipmentViewToggleMenu state={state} dispatch={dispatch} />
            </Toolbar>
          </List>
        </AppBar>
        {(!state.categoryDrawerView || !state.selectedCategory) && (
          <EquipmentList
            dispatch={dispatch}
            state={state}
            selectedEquipment={selectedEquipment}
            userRestriction={user.restriction}
            categories={categories}
          />
        )}
        {state.categoryDrawerView && state.selectedCategory && (
          <EquipmentStandardList
            setFieldValue={state.setFieldValue}
            selectedEquipment={selectedEquipment}
            userRestriction={user.restriction}
          />
        )}
      </div>
    </Dialog>
  );
};

export default EquipmentForm;
