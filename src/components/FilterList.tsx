import React, { FunctionComponent } from "react";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";
import FilterItem from "./FilterItem";

interface FilterListProps {
  filters: { [k: string]: boolean };
  visibleFilters: Set<string>;
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T = string | React.ChangeEvent<any>>(
      field: T
    ): T extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
}
const FilterList: FunctionComponent<FilterListProps> = ({
  filters,
  visibleFilters,
  handleChange
}) => {
  //const filterKeys = visibleFilters.sort();
  //this should be able to be filterKeys = visibileFilters.entries ovalues or something
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
            handleChange={handleChange}
          />
        ))}
      </List>
    </Box>
  );
};

export default FilterList;
