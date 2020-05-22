import React, { FunctionComponent } from "react";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import GearItem from "./GearItem";
import Gear from "../resources/Gear";

interface NestedListProps {
  parent: string;
  gearList: Gear[];
  selectedCategory: string;
  setCurrentCategory: (group: string) => void;
  changeQuantity: (field: string, value: number) => void;
  quantities: {
    [k: string]: number;
  };
}
const NestedList: FunctionComponent<NestedListProps> = ({
  parent,
  gearList,
  selectedCategory,
  setCurrentCategory,
  quantities,
  changeQuantity
}) => {
  const expanded = selectedCategory === parent ? true : false;
  return (
    <ExpansionPanel expanded={expanded}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions1-content"
        id="additional-actions1-header"
        onClick={(event): void => {
          event.stopPropagation();
          setCurrentCategory(parent);
        }}
      >
        {parent}
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
        <List
          style={{
            flexDirection: "column",
            minWidth: "100%"
          }}
        >
          {gearList
            .filter((item) => item.parentId === parent)
            .map((item) => (
              <GearItem
                item={item}
                quantity={quantities[item.title]}
                changeQuantity={changeQuantity}
              />
            ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
export default NestedList;
