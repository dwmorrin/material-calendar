import React, { FunctionComponent } from "react";
import { Box, List } from "@material-ui/core";
import FilterItem from "./FilterItem";
import { EquipmentState, EquipmentAction } from "./types";

interface FilterListProps {
  state: EquipmentState;
  dispatch: (action: EquipmentAction) => void;
}
const FilterList: FunctionComponent<FilterListProps> = ({
  state,
  dispatch,
}) => {
  // Create list of FilterItems from visible (valid for that category) filters
  const validTags = state.tags.filter(
    (tag) => tag.category.id === state.selectedCategory?.id
  );
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
