import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
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
  quantities: {
    [k: string]: number;
  },
  changeQuantity: (field: string, value: any) => void,
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
        <GearItem
          item={item}
          quantity={quantities[item.title]}
          handleChange={handleChange}
          changeQuantity={changeQuantity}
        />
      ))}
    </List>
  );
}

interface GearListProps {
  gearList: Gear[] | undefined;
  selectedGroup: string;
  changeCurrentGroup: (group: string) => void;
  changeQuantity: (field: string, value: any) => void;
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
const GearList: FunctionComponent<GearListProps> = ({
  gearList,
  selectedGroup,
  changeCurrentGroup,
  quantities,
  handleChange,
  changeQuantity
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
                  quantities={quantities}
                  handleChange={handleChange}
                  changeQuantity={changeQuantity}
                />
              );
            })
          : createStandardList(
              gearList,
              quantities,
              changeQuantity,
              handleChange
            )}
      </div>
    );
  } else {
    return <div></div>;
  }
};
export default GearList;
