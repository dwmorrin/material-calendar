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
  values: {
    quantity: number;
    items?: { id: number; quantity: number }[];
  };
  setFieldValue: (
    field: string,
    value:
      | string
      | number
      | boolean
      | {
          quantity: number;
          items?:
            | {
                id: number;
                quantity: number;
              }[]
            | undefined;
        }
  ) => void;
  reserveEquipment: (id: number, quantity: number) => void;
  userRestriction: number;
}
const EquipmentItem: FunctionComponent<EquipmentItemProps> = ({
  item,
  values,
  setFieldValue,
  userRestriction,
}) => {
  const [errors, setErrors] = React.useState({} as { [k: string]: boolean });
  const itemName = getItemName(item);
  if (!values) {
    values = { quantity: 0 };
  }
  const changeValue = (newValue: number): void => {
    if (newValue < 0) return;
    if (newValue > item.quantity) {
      return setErrors({ ...errors, itemName: true });
    }
    if (itemName in errors) setErrors({ ...errors, itemName: false });
    setFieldValue("equipment[" + itemName + "]", {
      ...values,
      quantity: newValue,
    });
  };
  const userCanUseEquipment = userRestriction >= item.restriction;

  return (
    <div
      style={{
        flexDirection: "row",
        textTransform: "capitalize",
      }}
    >
      <ListItem>
        <ListItemText primary={itemName} />
        {userCanUseEquipment ? (
          <section
            style={{
              textAlign: "center",
              flexDirection: "column",
            }}
          >
            {values.quantity}
            <br />
            <ButtonGroup
              variant="contained"
              color="primary"
              aria-label={itemName + "Quantity Buttons"}
              size="small"
            >
              <Button
                disabled={values.quantity - 1 < 0}
                onClick={(): void => {
                  changeValue(values.quantity - 1);
                }}
              >
                -
              </Button>
              <Button
                disabled={values.quantity + 1 > item.quantity}
                onClick={(): void => {
                  changeValue(values.quantity + 1);
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
        ) : (
          <p>You are not authorized to use this item</p>
        )}
      </ListItem>
    </div>
  );
};
export default EquipmentItem;
