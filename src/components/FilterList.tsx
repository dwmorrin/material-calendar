import React, { FunctionComponent } from "react";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";
import FilterItem from "./FilterItem";

interface FilterListProps {
  filters: { [k: string]: boolean };
  setFieldValue: (field: string, value: number | string | boolean) => void;
}
const FilterList: FunctionComponent<FilterListProps> = ({
  filters,
  setFieldValue,
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
        {Object.keys(filters).map((name) => (
          <FilterItem
            key={name}
            name={name}
            value={filters[name]}
            setFieldValue={setFieldValue}
          />
        ))}
      </List>
    </Box>
  );
};

export default FilterList;
