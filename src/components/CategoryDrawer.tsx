import React, { FunctionComponent } from "react";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import Category from "../resources/Category";
import CategoryItem from "./CategoryItem";
import { Button, IconButton } from "@material-ui/core";
import {
  EquipmentAction,
  EquipmentState,
  EquipmentActionTypes,
} from "../equipmentForm/types";

interface CategoryDrawerProps {
  state: EquipmentState;
  dispatch: (action: EquipmentAction) => void;
  onClose: () => void;
  onOpen: () => void;
}
const CategoryDrawer: FunctionComponent<CategoryDrawerProps> = ({
  state,
  dispatch,
  onClose,
  onOpen,
}) => {
  const items: Category[] | null = state.currentCategory
    ? state.currentCategory.children || null
    : Category.tree(state.categories);
  return (
    <SwipeableDrawer
      open={state.categoryDrawerIsOpen}
      anchor="top"
      onClose={onClose}
      onOpen={onOpen}
    >
      {state.currentCategory && (
        <Button
          style={{ backgroundColor: "Grey", color: "white" }}
          variant="contained"
          onClick={(): void => {
            dispatch({
              type: EquipmentActionTypes.ReturnToPreviousCategory,
              payload: {},
            });
          }}
        >
          {"Return to " +
            (state.previousCategory[state.previousCategory.length - 1]?.title ||
              "All Items")}
        </Button>
      )}
      {items?.map((item) => (
        <CategoryItem key={item.id} item={item} dispatch={dispatch} />
      ))}
      <IconButton
        onClick={(): void =>
          dispatch({
            type: EquipmentActionTypes.ToggleCategoryDrawer,
            payload: {},
          })
        }
      >
        <ExpandLessIcon />
      </IconButton>
    </SwipeableDrawer>
  );
};

export default CategoryDrawer;
