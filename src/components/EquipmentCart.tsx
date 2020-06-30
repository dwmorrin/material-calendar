import React, { FunctionComponent } from "react";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import { EquipmentState } from "../equipmentForm/types";
import MenuItem from "@material-ui/core/MenuItem";
import { List, ListItem, ListItemText, Typography } from "@material-ui/core";
import Select from "@material-ui/core/Select";

interface EquipmentCartProps {
  state: EquipmentState;
  onClose: () => void;
  onOpen: () => void;
  selectedEquipment: {
    [k: string]: number;
  };
  setFieldValue: (field: string, value: number | string | boolean) => void;
}
const EquipmentCart: FunctionComponent<EquipmentCartProps> = ({
  state,
  onClose,
  onOpen,
  selectedEquipment,
  setFieldValue,
}) => {
  const selectedItems = Object.keys(selectedEquipment).filter(function (
    key: string
  ) {
    return selectedEquipment[key] > 0;
  });

  return (
    <SwipeableDrawer
      open={state.equipmentCartIsOpen}
      anchor="top"
      onClose={onClose}
      onOpen={onOpen}
    >
      <Typography variant="subtitle2" style={{ textAlign: "center" }}>
        Equipment in your cart
      </Typography>
      <hr
        style={{
          minWidth: "100%",
        }}
      />
      {selectedItems.length > 0 ? (
        <List>
          {selectedItems.map((item) => {
            const selectOptions = Array.from({
              length: selectedEquipment[item] + 1,
            }).map((_, i) => (
              <MenuItem key={i} value={i}>
                {i}
              </MenuItem>
            ));
            return (
              <div
                key={item}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  textTransform: "capitalize",
                }}
              >
                <ListItem>
                  <ListItemText primary={item} />
                  <Select
                    labelId={item + "Quantity Select"}
                    name={"equipment[" + item + "]"}
                    value={selectedEquipment[item]}
                    onChange={(event): void =>
                      setFieldValue(
                        "equipment[" + item + "]",
                        event.target.value as number
                      )
                    }
                  >
                    {selectOptions}
                  </Select>
                </ListItem>
              </div>
            );
          })}
        </List>
      ) : (
        <div>
          You haven't reserved any equipment yet! Select some equipment from the
          list below!
        </div>
      )}
    </SwipeableDrawer>
  );
};

export default EquipmentCart;
