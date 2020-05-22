import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import React, { FunctionComponent } from "react";

interface FilterItemProps {
  name: string;
  value: boolean;
  setFieldValue: (field: string, value: number | string | boolean) => void;
}
const FilterItem: FunctionComponent<FilterItemProps> = ({
  name,
  value,
  setFieldValue
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
            onChange={(event): void =>
              setFieldValue("filters[" + name + "]", !value)
            }
            onClick={(event): void => {
              event.stopPropagation();
            }}
            checked={value}
            size="small"
            inputProps={{ "aria-label": name + " Checkbox" }}
          />
        </section>
      </ListItem>
    </div>
  );
};
export default FilterItem;
