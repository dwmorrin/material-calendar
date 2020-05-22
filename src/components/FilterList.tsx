import React, { FunctionComponent } from "react";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";
import FilterItem from "./FilterItem";

interface FilterListProps {
  filters: { [k: string]: boolean };
  visibleFilters: Set<string>;
  setFieldValue: (field: string, value: number | string | boolean) => void;
}
const FilterList: FunctionComponent<FilterListProps> = ({
  filters,
  visibleFilters,
  setFieldValue
}) => {
  const filterKeys = Array.from(visibleFilters).sort();
  return (
    <Box>
      <List
        style={{
          flexDirection: "column",
          minWidth: "100%"
        }}
      >
        {filterKeys.map((name) => (
          <FilterItem
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
