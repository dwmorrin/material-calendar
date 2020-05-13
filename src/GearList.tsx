import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Box from "@material-ui/core/Box";
import GearItem from "./GearItem";

const useStyles = makeStyles({
  root: {
    width: "100%"
  }
});

function drawQuantity(item: {
  id: string;
  parentId: string;
  title: string;
  tags: string;
}): JSX.Element {
  return (
    <ButtonGroup
      variant="contained"
      color="primary"
      aria-label="contained primary button group"
      size="small"
    >
      <Button>-</Button>
      <Button>+</Button>
    </ButtonGroup>
  );
}

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
  gearList: {
    id: string;
    parentId: string;
    title: string;
    tags: string;
  }[];
}
const GearList: FunctionComponent<GearListProps> = ({ gearList }) => {
  const parents = [...new Set(gearList.map((items) => items.parentId))];
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {parents.length > 1
        ? parents.map((parent) => {
            return gearList.filter((obj) => obj.parentId === parent).length > 1
              ? createNestedList(parent, gearList)
              : createStandardList(
                  gearList.filter((obj) => obj.parentId === parent)
                );
          })
        : createStandardList(gearList)}
    </div>
  );
};
export default GearList;
