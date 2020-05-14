import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import GearItem from "./GearItem";

const useStyles = makeStyles({
  root: {
    width: "100%"
  }
});

function createNestedList(
  parent: string,
  gearList: {
    id: string;
    parentId: string;
    title: string;
    tags: string;
  }[]
): JSX.Element {
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions1-content"
        id="additional-actions1-header"
        onClick={(event): void => event.stopPropagation()}
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
}

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
  const classes = useStyles();
  if (gearList) {
    const parents = [...new Set(gearList.map((items) => items.parentId))];
    return (
      <div className={classes.root}>
        {parents.length > 1
          ? parents.map((parent) => {
              return gearList.filter((obj) => obj.parentId === parent).length >
                1
                ? createNestedList(parent, gearList)
                : createStandardList(
                    gearList.filter((obj) => obj.parentId === parent)
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
