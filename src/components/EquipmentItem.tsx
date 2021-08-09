import { ListItem, ListItemText, Button, ButtonGroup } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { EquipmentItemProps } from "../equipmentForm/types";

const EquipmentItem: FunctionComponent<EquipmentItemProps> = ({
  name,
  item,
  setFieldValue,
  userRestriction,
}) => {
  const changeValue = (newValue: number): void => {
    if (newValue < 0 || newValue > item.maxQuantity) return;
    setFieldValue(`equipment["${name}"].quantity`, newValue);
  };
  const userCanUseEquipment = userRestriction >= item.restriction;
  const { quantity } = item;

  return (
    <div
      style={{
        flexDirection: "row",
        textTransform: "capitalize",
      }}
    >
      <ListItem>
        <ListItemText primary={name} />
        {userCanUseEquipment ? (
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
              aria-label={"change item quantity"}
              size="small"
            >
              <Button
                disabled={quantity === 0}
                onClick={(): void => changeValue(quantity - 1)}
              >
                -
              </Button>
              <Button
                disabled={quantity === item.maxQuantity}
                onClick={(): void => changeValue(quantity + 1)}
              >
                +
              </Button>
            </ButtonGroup>
          </section>
        ) : (
          <p>Restricted item</p>
        )}
      </ListItem>
    </div>
  );
};
export default EquipmentItem;
