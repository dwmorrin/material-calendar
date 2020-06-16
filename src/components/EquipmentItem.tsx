import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import React, { FunctionComponent } from "react";
import ErrorIcon from "@material-ui/icons/Error";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Equipment from "../resources/Equipment";

interface EquipmentItemProps {
  item: Equipment;
  quantity: number;
  setFieldValue: (field: string, value: number | string | boolean) => void;
}
const EquipmentItem: FunctionComponent<EquipmentItemProps> = ({
  item,
  quantity,
  setFieldValue,
}) => {
  //it would be great for this to be a getter
  const itemName = item.manufacturer && item.model ?item.manufacturer + " " + item.model : item.description;
  // Create all possible quantities for current item
  const selectOptions: JSX.Element[] = [];
  for (let i = 0; i <= item.quantity; ++i) {
    selectOptions.push(<MenuItem value={i}>{i}</MenuItem>);
  }

  // Show ErrorIcon
  const showError = (): void => {
    const element = document.getElementById("error"+ item.description);
    if (element) {
      element.style.display = "block";
    }
  };

  // Change current Equipment Value
  const changeValue = (newValue: number): void => {
    if (newValue >= 0 && newValue <= item.quantity) {
      setFieldValue("equipment[" + itemName + "]", newValue);
    }
    if (newValue > item.quantity) {
      showError();
    }
  };

  return (
    <div
      style={{
        flexDirection: "row",
        textTransform: "capitalize",
      }}
    >
      <ListItem>
        <ListItemText primary={itemName} />
        <section
          style={{
            textAlign: "center",
            flexDirection: "column",
          }}
        >
          <Select
            labelId={itemName + "Quantity Select"}
            name={"equipment[" + itemName + "]"}
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
            aria-label={itemName + "Quantity Buttons"}
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
          <div style={{ display: "none" }} id={"error"+ itemName}>
            <ErrorIcon />
          </div>
        </section>
      </ListItem>
    </div>
  );
};
export default EquipmentItem;
