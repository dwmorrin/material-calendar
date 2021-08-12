import React, { FunctionComponent } from "react";
import List from "@material-ui/core/List";
import EquipmentItem from "./EquipmentItem";
import { EquipmentStandardListProps } from "./types";

const EquipmentStandardList: FunctionComponent<EquipmentStandardListProps> = ({
  // equipmentList,
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
      {Object.entries(selectedEquipment).map(([name, item], index) => (
        <EquipmentItem
          key={"item-list-item-" + index}
          name={name}
          item={item}
          setFieldValue={setFieldValue}
          userRestriction={userRestriction}
        />
      ))}
    </List>
  );
};
export default EquipmentStandardList;
