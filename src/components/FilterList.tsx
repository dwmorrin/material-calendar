import React, { FunctionComponent } from "react";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";
import FilterItem from "./FilterItem";

interface FilterListProps {
  filters: { [k: string]: boolean };
  validTags: string[];
  setFieldValue: (field: string, value: number | string | boolean) => void;
}
const FilterList: FunctionComponent<FilterListProps> = ({
  filters,
  validTags,
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
        {validTags.map((tag) => (
          <FilterItem
            key={tag}
            name={tag}
            value={filters[tag]}
            setFieldValue={setFieldValue}
          />
        ))}
      </List>
    </Box>
  );
};

export default FilterList;
