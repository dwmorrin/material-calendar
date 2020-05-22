import React, { FunctionComponent } from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import GearItem from "./GearItem";
import Gear from "../resources/Gear";

interface NestedListProps {
  gearList: Gear[];
  selectedCategory: string;
  setCurrentCategory: (group: string) => void;
  setFieldValue: (field: string, value: number | string | boolean) => void;
  quantities: {
    [k: string]: number;
  };
}
const NestedList: FunctionComponent<NestedListProps> = ({
  gearList,
  selectedCategory,
  setCurrentCategory,
  quantities,
  setFieldValue
}) => {
  const expanded = selectedCategory === gearList[0].parentId ? true : false;
  return (
    <ExpansionPanel expanded={expanded}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label={gearList[0].parentId + "category expansion"}
        aria-controls={gearList[0].parentId + "category expansion"}
        id={gearList[0].parentId + "category expansion"}
        onClick={(event): void => {
          event.stopPropagation();
          setCurrentCategory(gearList[0].parentId);
        }}
      >
        {gearList[0].parentId}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <List
          style={{
            flexDirection: "column",
            minWidth: "100%"
          }}
        >
          {gearList
            .filter((item) => item.parentId === gearList[0].parentId)
            .map((item) => (
              <GearItem
                item={item}
                quantity={quantities[item.title]}
                setFieldValue={setFieldValue}
              />
            ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
export default NestedList;
