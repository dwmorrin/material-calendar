import React, { FunctionComponent } from "react";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";
import FilterItem from "./FilterItem";
import { EquipmentState, EquipmentAction } from "../equipmentForm/types";

interface FilterListProps {
  state: EquipmentState;
  dispatch: (action: EquipmentAction) => void;
}
const FilterList: FunctionComponent<FilterListProps> = ({
  state,
  dispatch,
}) => {
  // Create list of FilterItems from visible (valid for that category) filters
  return (
    <Box>
      <List
        style={{
          flexDirection: "column",
          minWidth: "100%",
        }}
      >
        {Object.keys(state.selectedTags).map((name) => (
          <FilterItem
            key={name}
            name={name}
            value={state.selectedTags[name]}
            dispatch={dispatch}
          />
        ))}
      </List>
    </Box>
  );
};

export default FilterList;
