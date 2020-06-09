import React, { FunctionComponent } from "react";
import { List, ListItem, Typography } from "@material-ui/core";

interface QuantityListProps {
  quantities: {
    [k: string]: number;
  };
}
const FilterList: FunctionComponent<QuantityListProps> = ({ quantities }) => {
  const selectedItems = Object.keys(quantities).filter(function (key: string) {
    return quantities[key] > 0;
  });
  // Get list of elements to be reserved and display them nicely
  return (
    <div>
      <Typography variant="subtitle2" style={{ textAlign: "center" }}>
        Gear in your cart
      </Typography>
      <hr />
      <List
        style={{
          flexDirection: "column",
          minWidth: "100%",
        }}
      >
        {selectedItems.length > 0 ? (
          <div>
            {selectedItems.map((item) => (
              <ListItem key={item}>{item + ": " + quantities[item]}</ListItem>
            ))}
          </div>
        ) : (
          <div>
            You haven't reserved any gear yet! Click the button below to add
            gear to your cart
          </div>
        )}
      </List>
    </div>
  );
};

export default FilterList;
