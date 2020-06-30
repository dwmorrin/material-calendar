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
  selectedCategory: string;
  setFieldValue: (field: string, value: number | string | boolean) => void;
  selectedEquipment: {
    [k: string]: number;
  };
}
const EquipmentExpansionList: FunctionComponent<EquipmentExpansionListProps> = ({
  equipmentList,
  selectedCategory,
  selectedEquipment,
  setFieldValue,
}) => {
  // Manage the currently expanded category using string identifiers assigned by parentId
  const changeCategory = (newCategory: string): void =>
    setFieldValue(
      "selectedCategory",
      newCategory === selectedCategory ? "" : newCategory
    );

  // Expand panel when the currently selected category is this EquipmentExpansionList's cateogory (parentId)
  const expanded = selectedCategory.includes(equipmentList[0].category.title);
  return (
    <div
      style={{
        textTransform: "capitalize",
      }}
    >
      <ExpansionPanel expanded={expanded}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-label={equipmentList[0].category.title + "category expansion"}
          aria-controls={equipmentList[0].category.title + "category expansion"}
          id={equipmentList[0].category.title + "category expansion"}
          onClick={(event): void => {
            event.stopPropagation();
            changeCategory(equipmentList[0].category.title);
          }}
        >
          {equipmentList[0].category.title}
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <List
            style={{
              flexDirection: "column",
              minWidth: "100%",
            }}
          >
            {equipmentList
              .filter(
                (item) =>
                  item.category.path ||
                  item.category.title === equipmentList[0].category.title
              )
              .map((item) => (
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
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </div>
  );
};
export default EquipmentExpansionList;
