import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import GearItem from "./GearItem";

// here is how to do this. set a string in the parent that is blank, pass a setState and that string down the line that will set that string to the passed value and pass the parentID of the nested list into that.
// in each nested list check this string and if it matches the parent set expanded to true.

interface NestedListProps {
  parent: string;
  gearList: {
    id: string;
    parentId: string;
    title: string;
    tags: string;
  }[];
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
}
const NestedList: FunctionComponent<NestedListProps> = ({
  parent,
  gearList,
  selectedGroup,
  setSelectedGroup
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
              <GearItem item={item} />
            ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};
export default NestedList;
