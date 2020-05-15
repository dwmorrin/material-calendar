import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import React, { FunctionComponent, useState } from "react";
import ErrorIcon from "@material-ui/icons/Error";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";

interface GearItemProps {
  item: {
    id: string;
    parentId: string;
    title: string;
    tags: string;
    quantity: number;
  };
}
const GearItem: FunctionComponent<GearItemProps> = ({ item }) => {
  const [value, setValue] = useState(0);
  const handleChange = (newValue: number): void => {
    console.log(newValue);
    if (newValue >= 0) {
      setValue(newValue);
    }
  };
  const changeSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    handleChange(event.target.value as number);
  };

  const items: JSX.Element[] = [];
  for (let i = 0; i <= item.quantity; ++i) {
    items.push(<MenuItem value={i}>{i}</MenuItem>);
  }
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
          <Select
            labelId="demo-customized-select-label"
            id="demo-customized-select"
            value={value}
            onChange={changeSelect}
          >
            {items}
          </Select>
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
