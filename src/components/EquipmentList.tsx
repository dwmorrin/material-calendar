import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import EquipmentExpansionList from "./EquipmentExpansionList";
import Equipment from "../resources/Equipment";
import EquipmentStandardList from "./EquipmentStandardList";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

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
        {category.length > 1 ? (
          category.map((parent) => {
            return (
              <EquipmentExpansionList
                equipmentList={equipmentList.filter(
                  (item) => item.category === parent
                )}
                currentCategory={currentCategory}
                quantities={quantities}
                setFieldValue={setFieldValue}
              />
            );
          })
        ) : (
          <EquipmentStandardList
            equipmentList={equipmentList}
            quantities={quantities}
            setFieldValue={setFieldValue}
          />
        )}
      </div>
    );
  } else {
    return <div></div>;
  }
};
export default EquipmentList;
