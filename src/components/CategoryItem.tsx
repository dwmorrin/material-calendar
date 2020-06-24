import Button from "@material-ui/core/Button";
import React, { FunctionComponent } from "react";
import Category from "../resources/Category";
import { EquipmentAction, EquipmentActionTypes } from "../equipmentForm/types";

interface CategoryItemProps {
  item: Category | null;
  dispatch: (action: EquipmentAction) => void;
}
const CategoryItem: FunctionComponent<CategoryItemProps> = ({
  item,
  dispatch,
}) => {
  if (!item) {
    // this should be the back button?
    return null;
  }
  return (
    <Button
      variant="contained"
      onClick={(): void => {
        dispatch({
          type: EquipmentActionTypes.SelectedCategory,
          payload: { currentCategory: item },
        });
      }}
    >
      {item.title}
    </Button>
  );
};
export default CategoryItem;
