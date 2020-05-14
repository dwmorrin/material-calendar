import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Box from "@material-ui/core/Box";
import Filter from "./Filter";

interface FilterListProps {
  filters: {
    name: string;
    toggle: boolean;
  }[];
  toggleFunction: (filter: { name: string; toggle: boolean }) => void;
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
            <Filter filter={filter} toggleFunction={toggleFunction} />
          ))}
      </List>
    </Box>
  );
};

export default FilterList;
