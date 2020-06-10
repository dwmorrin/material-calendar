import React, { FunctionComponent } from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import EquipmentItem from "./EquipmentItem";
import Equipment from "../resources/Equipment";

interface NestedListProps {
  equipmentList: Equipment[];
  currentCategory: string;
  setFieldValue: (field: string, value: number | string | boolean) => void;
  quantities: {
    [k: string]: number;
  };
}
const NestedList: FunctionComponent<NestedListProps> = ({
  equipmentList,
  currentCategory,
  quantities,
  setFieldValue,
}) => {
  // Manage the currently expanded category using string identifiers assigned by parentId
  const changeCategory = (newCategory: string): void => {
    if (newCategory === currentCategory) {
      setFieldValue("currentCategory", "");
    } else {
      setFieldValue("currentCategory", newCategory);
    }
  };

  // Expand panel when the currently selected category is this NestedList's cateogory (parentId)
  const expanded = currentCategory === equipmentList[0].category ? true : false;
  return (
    <ExpansionPanel expanded={expanded}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label={equipmentList[0].category + "category expansion"}
        aria-controls={equipmentList[0].category + "category expansion"}
        id={equipmentList[0].category + "category expansion"}
        onClick={(event): void => {
          event.stopPropagation();
          changeCategory(equipmentList[0].category);
        }}
      >
        {equipmentList[0].category}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <List
          style={{
            flexDirection: "column",
            minWidth: "100%",
          }}
        >
          {equipmentList
            .filter((item) => item.category === equipmentList[0].category)
            .map((item) => (
              <EquipmentItem
                item={item}
                quantity={quantities[item.description]}
                setFieldValue={setFieldValue}
              />
            ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
export default NestedList;
