import React, { FunctionComponent } from "react";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import { EquipmentState } from "../equipmentForm/types";
import QuantityList from "./QuantityList";

interface EquipmentCartProps {
  state: EquipmentState;
  onClose: () => void;
  onOpen: () => void;
  selectedEquipment: {
    [k: string]: number;
  };
}
const EquipmentCart: FunctionComponent<EquipmentCartProps> = ({
  state,
  onClose,
  onOpen,
  selectedEquipment,
}) => {
  return (
    <SwipeableDrawer
      open={state.equipmentCartIsOpen}
      anchor="top"
      onClose={onClose}
      onOpen={onOpen}
    >
      <QuantityList selectedEquipment={selectedEquipment} />
    </SwipeableDrawer>
  );
};

export default EquipmentCart;
