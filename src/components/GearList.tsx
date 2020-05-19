import React, { FunctionComponent, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import GearItem from "./GearItem";
import NestedList from "./NestedList";
import Gear from "../resources/Gear";

const useStyles = makeStyles({
  root: {
    width: "100%"
  }
});

function createStandardList(
  gearList: Gear[],
  values: {
    quantities: {
      [k: string]: number;
    };
  },
  handleChange: {
    (e: React.ChangeEvent<any>): void;
    <T = string | React.ChangeEvent<any>>(
      field: T
    ): T extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  }
): JSX.Element {
  return (
    <List
      style={{
        flexDirection: "column",
        minWidth: "100%"
      }}
    >
      {gearList.map((item) => (
        <GearItem item={item} values={values} handleChange={handleChange} />
      ))}
    </List>
  );
}

interface GearListProps {
  gearList: Gear[] | undefined;
  selectedGroup: string;
  changeCurrentGroup: (group: string) => void;
  values: {
    quantities: {
      [k: string]: number;
    };
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
const GearList: FunctionComponent<GearListProps> = ({
  gearList,
  selectedGroup,
  changeCurrentGroup,
  values,
  handleChange
}) => {
  const classes = useStyles();
  if (gearList) {
    const parents = [...new Set(gearList.map((items) => items.parentId))];
    return (
      <div className={classes.root}>
        {parents.length > 1
          ? parents.map((parent) => {
              return (
                <NestedList
                  parent={parent}
                  gearList={gearList}
                  selectedGroup={selectedGroup}
                  setSelectedGroup={changeCurrentGroup}
                  values={values}
                  handleChange={handleChange}
                />
              );
            })
          : createStandardList(gearList, values, handleChange)}
      </div>
    );
  } else {
    return <div></div>;
  }
};
export default GearList;
