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
    [k: string]: {
      quantity: number;
      items?: { id: number; quantity: number }[];
    };
  };
  setFieldValue: (
    field: string,
    value:
      | string
      | number
      | boolean
      | {
          quantity: number;
          items?:
            | {
                id: number;
                quantity: number;
              }[]
            | undefined;
        }
  ) => void;
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
    return selectedEquipment[key].quantity > 0;
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
          {selectedItems.map((key) => {
            const selectOptions = Array.from({
              length: selectedEquipment[key].quantity + 1,
            }).map((_, i) => (
              <MenuItem key={i} value={i}>
                {i}
              </MenuItem>
            ));
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  textTransform: "capitalize",
                }}
              >
                <ListItem>
                  <ListItemText primary={key} />
                  <Select
                    labelId={key + "Quantity Select"}
                    name={"equipment[" + key + "]"}
                    value={selectedEquipment[key].quantity}
                    onChange={(event): void =>
                      setFieldValue("equipment[" + key + "]", {
                        ...selectedEquipment[key],
                        quantity: event.target.value as number,
                      })
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
