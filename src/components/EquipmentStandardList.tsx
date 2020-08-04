import React, { FunctionComponent } from "react";
import List from "@material-ui/core/List";
import EquipmentItem from "./EquipmentItem";
import Equipment from "../resources/Equipment";

interface EquipmentStandardListProps {
  equipmentList?: Equipment[];
  reserveEquipment: (id: number, quantity: number) => void;
  selectedEquipment: {
    [k: string]: {
      quantity: number;
      items?: { id: number; quantity: number }[];
    };
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
}
const EquipmentStandardList: FunctionComponent<EquipmentStandardListProps> = ({
  equipmentList,
  selectedEquipment,
  setFieldValue,
  reserveEquipment,
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
            values={
              selectedEquipment[
                item.manufacturer && item.model
                  ? item.manufacturer + " " + item.model
                  : item.description
              ]
            }
            setFieldValue={setFieldValue}
            reserveEquipment={reserveEquipment}
          />
        ))}
    </List>
  );
};
export default EquipmentStandardList;
