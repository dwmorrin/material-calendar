import React, { FunctionComponent } from "react";
import List from "@material-ui/core/List";
import EquipmentItem from "./EquipmentItem";
import Equipment from "../resources/Equipment";

interface EquipmentStandardListProps {
  equipmentList?: Equipment[];
  selectedEquipment: {
    [k: string]: number;
  };
  setFieldValue: (field: string, value: number | string | boolean) => void;
}
const EquipmentStandardList: FunctionComponent<EquipmentStandardListProps> = ({
  equipmentList,
  selectedEquipment,
  setFieldValue,
}) => {
  // Create list of single elements. may not work properly for singletons
  return (
    <List
      style={{
        flexDirection: "column",
        minWidth: "100%",
      }}
    >
      {equipmentList &&
        equipmentList.map((item) => (
          <EquipmentItem
            key={item.id}
            item={item}
            quantity={
              selectedEquipment[
                item.manufacturer && item.model
                  ? item.manufacturer + " " + item.model
                  : item.description
              ]
            }
            setFieldValue={setFieldValue}
          />
        ))}
    </List>
  );
};
export default EquipmentStandardList;
