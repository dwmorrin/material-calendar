import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import React, { FunctionComponent } from "react";

interface FilterItemProps {
  name: string;
  value: boolean;
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T = string | React.ChangeEvent<any>>(
      field: T
    ): T extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
}
const FilterItem: FunctionComponent<FilterItemProps> = ({
  name,
  value,
  handleChange
}) => {
  return (
    <div
      style={{
        flexDirection: "row",
        textTransform: "capitalize"
      }}
    >
      <ListItem key={name}>
        <ListItemText primary={name} />
        <section
          style={{
            textAlign: "center",
            flexDirection: "column"
          }}
        >
          <Checkbox
            name={"filters[" + name + "]"}
            onChange={handleChange}
            onClick={(event): void => {
              event.stopPropagation();
            }}
            checked={value}
            size="small"
            inputProps={{ "aria-label": "checkbox with small size" }}
          />
        </section>
      </ListItem>
    </div>
  );
};
export default FilterItem;
