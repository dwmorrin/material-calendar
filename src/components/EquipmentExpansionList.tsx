import React, { FunctionComponent } from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import EquipmentItem from "./EquipmentItem";
import Equipment from "../resources/Equipment";

interface EquipmentExpansionListProps {
  equipmentList: Equipment[];
  currentCategory: string;
  setFieldValue: (field: string, value: number | string | boolean) => void;
  selectedEquipment: {
    [k: string]: number;
  };
}
const EquipmentExpansionList: FunctionComponent<EquipmentExpansionListProps> = ({
  equipmentList,
  currentCategory,
  selectedEquipment,
  setFieldValue,
}) => {
  // Manage the currently expanded category using string identifiers assigned by parentId
  const changeCategory = (newCategory: string): void =>
    setFieldValue("currentCategory", newCategory === currentCategory ? "" : newCategory);

  // Expand panel when the currently selected category is this EquipmentExpansionList's cateogory (parentId)
  const expanded = currentCategory.includes(equipmentList[0].category.path || equipmentList[0].category.name);
  return (
    <div
      style={{
        textTransform: "capitalize"
      }}
    >
    <ExpansionPanel expanded={expanded}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label={equipmentList[0].category.path || equipmentList[0].category.name + "category expansion"}
        aria-controls={equipmentList[0].category.path || equipmentList[0].category.name + "category expansion"}
        id={equipmentList[0].category.path || equipmentList[0].category.name + "category expansion"}
        onClick={(event): void => {
          event.stopPropagation();
          changeCategory(equipmentList[0].category.path || equipmentList[0].category.name);
        }}
      >
        {equipmentList[0].category.path || equipmentList[0].category.name}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <List
          style={{
            flexDirection: "column",
            minWidth: "100%",
          }}
        >
          {equipmentList
            .filter((item) => item.category.path || item.category.name === equipmentList[0].category.path || equipmentList[0].category.name)
            .map((item) => (
              <EquipmentItem
                item={item}
                quantity={selectedEquipment[item.manufacturer && item.model ?item.manufacturer + " " + item.model : item.description]}
                setFieldValue={setFieldValue}
              />
            ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
    </div>
  );
};
export default EquipmentExpansionList;
