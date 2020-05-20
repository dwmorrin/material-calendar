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
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  quantities: {
    [k: string]: number;
  };
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T = string | React.ChangeEvent<any>>(
      field: T
    ): T extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };
}
const NestedList: FunctionComponent<NestedListProps> = ({
  parent,
  gearList,
  selectedGroup,
  setSelectedGroup,
  quantities,
  handleChange
}) => {
  const expanded = selectedGroup === parent ? true : false;
  return (
    <ExpansionPanel expanded={expanded}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions1-content"
        id="additional-actions1-header"
        onClick={(event): void => {
          event.stopPropagation();
          setSelectedGroup(parent);
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
                quantities={quantities}
                handleChange={handleChange}
              />
            ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
export default NestedList;
