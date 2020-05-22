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
  changeQuantity: (field: string, value: number) => void
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
          changeQuantity={changeQuantity}
        />
      ))}
    </List>
  );
}

interface GearListProps {
  gearList: Gear[] | undefined;
  selectedCategory: string;
  changeCurrentCategory: (group: string) => void;
  changeQuantity: (field: string, value: number) => void;
  quantities: {
    [k: string]: number;
  };
}
const GearList: FunctionComponent<GearListProps> = ({
  gearList,
  selectedCategory,
  changeCurrentCategory,
  quantities,
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
                  gearList={gearList.filter((item) => item.parentId === parent)}
                  selectedCategory={selectedCategory}
                  setCurrentCategory={changeCurrentCategory}
                  quantities={quantities}
                  changeQuantity={changeQuantity}
                />
              );
            })
          : createStandardList(gearList, quantities, changeQuantity)}
      </div>
    );
  } else {
    return <div></div>;
  }
};
export default GearList;
