import React, { FunctionComponent, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import GearItem from "./GearItem";
import NestedList from "./NestedList";

const useStyles = makeStyles({
  root: {
    width: "100%"
  }
});

function createStandardList(
  gearList: {
    id: string;
    parentId: string;
    title: string;
    tags: string;
  }[]
): JSX.Element {
  return (
    <List
      style={{
        flexDirection: "column",
        minWidth: "100%"
      }}
    >
      {gearList.map((item) => (
        <GearItem item={item} />
      ))}
    </List>
  );
}

interface GearListProps {
  gearList:
    | {
        id: string;
        parentId: string;
        title: string;
        tags: string;
      }[]
    | undefined;
}
const GearList: FunctionComponent<GearListProps> = ({ gearList }) => {
  const [selectedGroup, setSelectedGroup] = useState("");
  const handleChange = (group: string): void => {
    if (group === selectedGroup) {
      setSelectedGroup("");
    } else {
      setSelectedGroup(group);
    }
  };
  const classes = useStyles();
  if (gearList) {
    const parents = [...new Set(gearList.map((items) => items.parentId))];
    return (
      <div className={classes.root}>
        {parents.length > 1
          ? parents.map((parent) => {
              return gearList.filter((obj) => obj.parentId === parent).length >
                1 ? (
                <NestedList
                  parent={parent}
                  gearList={gearList}
                  selectedGroup={selectedGroup}
                  setSelectedGroup={handleChange}
                />
              ) : (
                createStandardList(
                  gearList.filter((obj) => obj.parentId === parent)
                )
              );
            })
          : createStandardList(gearList)}
      </div>
    );
  } else {
    return <div></div>;
  }
};
export default GearList;
