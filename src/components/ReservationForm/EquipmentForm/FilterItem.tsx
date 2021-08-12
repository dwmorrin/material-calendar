import { ListItem, ListItemText, Checkbox } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { EquipmentAction, EquipmentActionTypes } from "./types";

interface FilterItemProps {
  name: string;
  value: boolean;
  dispatch: (action: EquipmentAction) => void;
}
const FilterItem: FunctionComponent<FilterItemProps> = ({
  name,
  value,
  dispatch,
}) => {
  return (
    <div
      style={{
        flexDirection: "row",
        textTransform: "capitalize",
      }}
    >
      <ListItem key={name}>
        <ListItemText primary={name} />
        <section
          style={{
            textAlign: "center",
            flexDirection: "column",
          }}
        >
          <Checkbox
            onChange={(): void =>
              dispatch({
                type: EquipmentActionTypes.SelectedFilter,
                payload: { selectedTags: { [name]: !value } },
              })
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
