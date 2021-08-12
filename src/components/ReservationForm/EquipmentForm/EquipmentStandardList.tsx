import React, { FunctionComponent } from "react";
import List from "@material-ui/core/List";
import EquipmentItem from "./EquipmentItem";
import { EquipmentStandardListProps } from "./types";

const EquipmentStandardList: FunctionComponent<EquipmentStandardListProps> = ({
  equipment,
  selectedEquipment,
  setFieldValue,
  userRestriction,
}) => {
  // Create list of single elements. may not work properly for singletons
  return (
    <List
      style={{
        flexDirection: "column",
        minWidth: "100%",
      }}
    >
      {Object.entries(equipment).map(([name, item], index) => (
        <EquipmentItem
          key={"item-list-item-" + index}
          name={name}
          item={name in selectedEquipment ? selectedEquipment[name] : item}
          setFieldValue={setFieldValue}
          userRestriction={userRestriction}
        />
      ))}
    </List>
  );
};
export default EquipmentStandardList;
