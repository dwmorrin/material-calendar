import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import React, { FunctionComponent, useState } from "react";

interface GearItemProps {
  item: {
    id: string;
    parentId: string;
    title: string;
    tags: string;
  };
}
const GearItem: FunctionComponent<GearItemProps> = ({ item }) => {
  const [value, setValue] = useState(0);
  const handleChange = (newValue: number): void => {
    if (newValue >= 0) {
      setValue(newValue);
    }
  };
  return (
    <div
      style={{
        flexDirection: "row"
      }}
    >
      <ListItem key={item.id}>
        <ListItemText primary={item.title} />
        <section
          style={{
            textAlign: "center",
            flexDirection: "column"
          }}
        >
          {value}
          <br />
          <ButtonGroup
            variant="contained"
            color="primary"
            aria-label="contained primary button group"
            size="small"
          >
            <Button onClick={(): void => handleChange(value - 1)}>-</Button>
            <Button onClick={(): void => handleChange(value + 1)}>+</Button>
          </ButtonGroup>
        </section>
      </ListItem>
    </div>
  );
};
export default GearItem;
