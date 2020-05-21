import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import React, { FunctionComponent } from "react";
import ErrorIcon from "@material-ui/icons/Error";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Gear from "../resources/Gear";

interface GearItemProps {
  item: Gear;
  quantity: number;
  changeQuantity: (field: string, value: any) => void;
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
  quantity,
  handleChange,
  changeQuantity
}) => {
  const items: JSX.Element[] = [];
  for (let i = 0; i <= item.quantity; ++i) {
    items.push(<MenuItem value={i}>{i}</MenuItem>);
  }
  const changeValue = (newValue: number): void => {
    if (newValue >= 0 && newValue <= item.quantity) {
      changeQuantity("gear[" + item.title + "]", newValue);
    }
    if (newValue > item.quantity) {
      toggleElement();
    }
  };

  const toggleElement = (): void => {
    const element = document.getElementById("error");
    if (element) {
      element.style.display = "block";
    }
  };

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
            name={"gear[" + item.title + "]"}
            value={quantity}
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
            <Button
              onClick={(): void => {
                changeValue(quantity - 1);
              }}
            >
              -
            </Button>
            <Button
              onClick={(): void => {
                changeValue(quantity + 1);
              }}
            >
              +
            </Button>
          </ButtonGroup>
          <div style={{ display: "none" }} id="error">
            <ErrorIcon />
          </div>
        </section>
      </ListItem>
    </div>
  );
};
export default GearItem;
