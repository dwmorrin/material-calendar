import React, { FunctionComponent } from "react";
import { List, ListItem, Typography } from "@material-ui/core";

interface QuantityListProps {
  selectedEquipment: {
    [k: string]: {
      quantity: number;
      items?: { id: number; quantity: number }[];
    };
  };
}
const FilterList: FunctionComponent<QuantityListProps> = ({
  selectedEquipment,
}) => {
  const selectedItems = Object.keys(selectedEquipment).filter(function (
    key: string
  ) {
    return selectedEquipment[key].quantity > 0;
  });
  // Get list of elements to be reserved and display them nicely
  return (
    <div>
      <Typography variant="subtitle2" style={{ textAlign: "center" }}>
        Equipment in your cart
      </Typography>
      <hr />
      <List
        style={{
          flexDirection: "column",
          minWidth: "100%",
        }}
      >
        {selectedItems.length > 0 ? (
          <div
            style={{
              textTransform: "capitalize",
            }}
          >
            {selectedItems.map((key) => (
              <ListItem key={key}>
                {key + ": " + selectedEquipment[key].quantity}
              </ListItem>
            ))}
          </div>
        ) : (
          <div>Cart is empty.</div>
        )}
      </List>
    </div>
  );
};

export default FilterList;
