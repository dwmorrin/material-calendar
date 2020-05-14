import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import React, { FunctionComponent, useState } from "react";

interface FilterProps {
  filter: {
    name: string;
    toggle: boolean;
  };
}
const Filter: FunctionComponent<FilterProps> = ({ filter }) => {
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
            defaultChecked
            size="small"
            inputProps={{ "aria-label": "checkbox with small size" }}
          />
        </section>
      </ListItem>
    </div>
  );
};
export default Filter;
