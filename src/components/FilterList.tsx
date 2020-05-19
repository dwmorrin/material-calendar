import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";
import FilterItem from "./FilterItem";
import Filter from "../resources/Filter";

interface FilterListProps {
  filters: Filter[];
  toggleFunction: (filter: Filter) => void;
}
const FilterList: FunctionComponent<FilterListProps> = ({
  filters,
  toggleFunction
}) => {
  return (
    <Box>
      <List
        style={{
          flexDirection: "column",
          minWidth: "100%"
        }}
      >
        {filters
          .filter((filter) => filter.name !== "")
          .map((filter) => (
            <FilterItem filter={filter} toggleFunction={toggleFunction} />
          ))}
      </List>
    </Box>
  );
};

export default FilterList;
