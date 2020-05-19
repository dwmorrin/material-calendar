import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import React, { FunctionComponent, useState } from "react";
import Filter from "../resources/Filter";

interface FilterItemProps {
  filter: Filter;
  toggleFunction: (filter: Filter) => void;
}
const FilterItem: FunctionComponent<FilterItemProps> = ({
  filter,
  toggleFunction
}) => {
  return (
    <div
      style={{
        flexDirection: "row"
      }}
    >
      <ListItem key={filter.name}>
        <ListItemText primary={filter.name} />
        <section
          style={{
            textAlign: "center",
            flexDirection: "column"
          }}
        >
          <Checkbox
            onClick={(event): void => {
              event.stopPropagation();
              toggleFunction(filter);
            }}
            checked={filter.toggle}
            size="small"
            inputProps={{ "aria-label": "checkbox with small size" }}
          />
        </section>
      </ListItem>
    </div>
  );
};
export default FilterItem;
