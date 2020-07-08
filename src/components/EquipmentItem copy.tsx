import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import React, { FunctionComponent } from "react";
import ErrorIcon from "@material-ui/icons/Error";
import Equipment from "../resources/Equipment";

const getItemName = (item: Equipment): string =>
  item.manufacturer && item.model
    ? item.manufacturer + " " + item.model
    : item.description;

interface EquipmentItemProps {
  item: Equipment;
  quantity: number;
  setFieldValue: (field: string, value: number | string | boolean) => void;
}
const EquipmentItem: FunctionComponent<EquipmentItemProps> = ({
  item,
  quantity = 0,
  setFieldValue,
}) => {
  const [errors, setErrors] = React.useState({} as { [k: string]: boolean });
  const itemName = getItemName(item);
  const changeValue = (newValue: number): void => {
    if (newValue < 0) return;
    if (newValue > item.quantity) {
      return setErrors({ ...errors, itemName: true });
    }
    if (itemName in errors) setErrors({ ...errors, itemName: false });
    setFieldValue("equipment[" + itemName + "]", newValue);
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
          {quantity}
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
          {errors[itemName] && (
            <div>
              <ErrorIcon />
            </div>
          )}
        </section>
      </ListItem>
    </div>
  );
};
export default EquipmentItem;
