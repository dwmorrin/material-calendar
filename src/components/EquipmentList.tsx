import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import EquipmentItem from "./EquipmentItem";
import NestedList from "./NestedList";
import Equipment from "../resources/Equipment";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

function createStandardList(
  equipmentList: Equipment[],
  quantities: {
    [k: string]: number;
  },
  setFieldValue: (field: string, value: any) => void
): JSX.Element {
  // Create list of single elements. may not work properly for singletons
  return (
    <List
      style={{
        flexDirection: "column",
        minWidth: "100%",
      }}
    >
      {equipmentList.map((item) => (
        <EquipmentItem
          item={item}
          quantity={quantities[item.description]}
          setFieldValue={setFieldValue}
        />
      ))}
    </List>
  );
}

interface EquipmentListProps {
  equipmentList: Equipment[] | undefined;
  currentCategory: string;
  setFieldValue: (field: string, value: number | string | boolean) => void;
  quantities: {
    [k: string]: number;
  };
}
const EquipmentList: FunctionComponent<EquipmentListProps> = ({
  equipmentList,
  currentCategory,
  quantities,
  setFieldValue,
}) => {
  const classes = useStyles();
  if (equipmentList) {
    const category = [...new Set(equipmentList.map((items) => items.category))];
    // Create Nested list for categories with multiple elements, create a standard (not nested)
    // list for singletons
    return (
      <div className={classes.root}>
        {category.length > 1
          ? category.map((parent) => {
              return (
                <NestedList
                  equipmentList={equipmentList.filter((item) => item.category === parent)}
                  currentCategory={currentCategory}
                  quantities={quantities}
                  setFieldValue={setFieldValue}
                />
              );
            })
          : createStandardList(equipmentList, quantities, setFieldValue)}
      </div>
    );
  } else {
    return <div></div>;
  }
};
export default EquipmentList;
