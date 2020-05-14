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
}
const FilterList: FunctionComponent<FilterListProps> = ({ filters }) => {
  return (
    <Box>
      <List
        style={{
          flexDirection: "column",
          minWidth: "100%"
        }}
      >
        {filters
          .filter((filter) => filter.name != "")
          .map((filter) => (
            <Filter filter={filter} />
          ))}
      </List>
    </Box>
  );
};

export default FilterList;
