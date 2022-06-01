import React, { FunctionComponent } from "react";
import { EquipmentCartProps } from "./types";
import MenuItem from "@material-ui/core/MenuItem";
import { List, ListItem, ListItemText, Typography } from "@material-ui/core";
import Select from "@material-ui/core/Select";

const EquipmentCart: FunctionComponent<EquipmentCartProps> = ({
  selectedEquipment,
  setFieldValue,
}) => {
  const selectedItems = Object.keys(selectedEquipment).filter(function (
    key: string
  ) {
    return selectedEquipment[key].quantity > 0;
  });

  return (
    <div>
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
            const item = selectedEquipment[key];
            const selectOptions = Array.from({
              length: item.maxQuantity + 1,
            }).map((_, i) => (
              <MenuItem key={i} value={i}>
                {i === 0 ? "0 (Delete)" : i}
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
        <div>Cart is empty.</div>
      )}
    </div>
  );
};

export default EquipmentCart;
