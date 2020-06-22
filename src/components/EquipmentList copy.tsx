import React, { FunctionComponent } from "react";
import Equipment from "../resources/Equipment";
import EquipmentStandardList from "./EquipmentStandardList";
import { EquipmentState, EquipmentAction } from "../equipmentForm/types";

interface EquipmentListProps {
  state: EquipmentState;
  dispatch: (action: EquipmentAction) => void;
  equipmentList: Equipment[] | undefined;
  selectedEquipment: {
    [k: string]: number;
  };
}
const EquipmentList: FunctionComponent<EquipmentListProps> = ({
  state,
  equipmentList,
  selectedEquipment,
}) => {
  if (!state.equipment.length) return null;
  return (
    <EquipmentStandardList
      equipmentList={equipmentList}
      selectedEquipment={selectedEquipment}
      setFieldValue={state.setFieldValue}
    />
  );
};
export default EquipmentList;
