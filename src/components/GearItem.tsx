import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import React, { FunctionComponent } from "react";
import ErrorIcon from "@material-ui/icons/Error";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Equipment from "../resources/Equipment";

interface GearItemProps {
  item: Equipment;
  quantity: number;
  setFieldValue: (field: string, value: number | string | boolean) => void;
}
const GearItem: FunctionComponent<GearItemProps> = ({
  item,
  quantity,
  setFieldValue,
}) => {
  // Create all possible quantities for current item
  const selectOptions: JSX.Element[] = [];
  for (let i = 0; i <= item.quantity; ++i) {
    selectOptions.push(<MenuItem value={i}>{i}</MenuItem>);
  }

  // Show ErrorIcon
  const showError = (): void => {
    const element = document.getElementById("error");
    if (element) {
      element.style.display = "block";
    }
  };

  // Change current Gear Value
  const changeValue = (newValue: number): void => {
    if (newValue >= 0 && newValue <= item.quantity) {
      setFieldValue("gear[" + item.title + "]", newValue);
    }
    if (newValue > item.quantity) {
      showError();
    }
  };

  return (
    <div
      style={{
        flexDirection: "row",
      }}
    >
      <ListItem>
        <ListItemText primary={item.description} />
        <section
          style={{
            textAlign: "center",
            flexDirection: "column",
          }}
        >
          <Select
            labelId={item.description + "Quantity Select"}
            name={"gear[" + item.description + "]"}
            value={quantity}
            onChange={(event): void =>
              changeValue(event.target.value as number)
            }
          >
            {selectOptions}
          </Select>
          <br />
          <ButtonGroup
            variant="contained"
            color="primary"
            aria-label={item.description + "Quantity Buttons"}
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
