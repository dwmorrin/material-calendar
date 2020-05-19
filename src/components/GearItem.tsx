import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import React, { FunctionComponent, useState } from "react";
import ErrorIcon from "@material-ui/icons/Error";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Gear from "../resources/Gear";

interface GearItemProps {
  item: Gear;
  values: {
    quantities: {
      [k: string]: number;
    };
  };
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T = string | React.ChangeEvent<any>>(
      field: T
    ): T extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
}
const GearItem: FunctionComponent<GearItemProps> = ({
  item,
  values,
  handleChange
}) => {
  const [count, setValue] = useState(values.quantities[item.title]);
  const changeValue = (newValue: number): void => {
    if (newValue >= 0) {
      values.quantities[item.title] = newValue;
    }
  };
  const changeSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    changeValue(event.target.value as number);
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
      <ListItem>
        <ListItemText primary={item.title} />
        <section
          style={{
            textAlign: "center",
            flexDirection: "column"
          }}
        >
          <Select
            labelId={item.title + "QuantitySelect"}
            name={"quantities[" + item.title + "]"}
            value={values.quantities[item.title]}
            onChange={handleChange}
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
            <Button onClick={(): void => changeValue(count - 1)}>-</Button>
            <Button onClick={(): void => changeValue(count + 1)}>+</Button>
          </ButtonGroup>
        </section>
      </ListItem>
    </div>
  );
};
export default GearItem;
