import React, { FunctionComponent } from "react";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";
import FilterItem from "./FilterItem";
import { EquipmentState, EquipmentAction } from "../equipmentForm/types";
import Category from "../resources/Category";

interface FilterListProps {
  state: EquipmentState;
  dispatch: (action: EquipmentAction) => void;
}
const FilterList: FunctionComponent<FilterListProps> = ({
  state,
  dispatch,
}) => {
  // Create list of FilterItems from visible (valid for that category) filters
  const validTags = state.currentCategory
    ? state.tags.filter((tag) =>
        Category.existsOnCategoryOrChildren(state.currentCategory, tag)
      )
    : state.tags;
  if (validTags.length < 1) {
    return <Box>{"Please select a category to see applicable filters"}</Box>;
  }
  return (
    <Box>
      <List
        style={{
          flexDirection: "column",
          minWidth: "100%",
        }}
      >
        {validTags.map((tag) => (
          <FilterItem
            key={tag.title}
            name={tag.title}
            value={state.selectedTags[tag.title]}
            dispatch={dispatch}
          />
        ))}
      </List>
    </Box>
  );
};

export default FilterList;
