import React, { FunctionComponent } from "react";
import Equipment from "../resources/Equipment";
import EquipmentStandardList from "./EquipmentStandardList";
import { EquipmentState, EquipmentAction } from "../equipmentForm/types";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { EquipmentActionTypes } from "../equipmentForm/types";
import Category from "../resources/Category";

interface EquipmentListProps {
  state: EquipmentState;
  dispatch: (action: EquipmentAction) => void;
  equipmentList: Equipment[] | undefined;
  selectedEquipment: {
    [k: string]: number;
  };
}
const EquipmentList: FunctionComponent<EquipmentListProps> = ({
  state,
  dispatch,
  equipmentList,
  selectedEquipment,
}) => {
  function changeCategory(selectedCategory: Category): Category | null {
    // if the category selected is the same as the current category, or
    // if it is the parent id of the selectedCategory (which means it is
    // already open), the user wants to close that expansion
    if (
      selectedCategory.id === state.currentCategory?.parentId ||
      (state.currentCategory &&
        state.currentCategory.id === selectedCategory.id)
    ) {
      return (
        state.categories.find(
          (category) => category.id === selectedCategory.parentId
        ) || null
      );
    }
    return (
      state.categories.find(
        (category) => category.id === selectedCategory.id
      ) || null
    );
  }
  if (!state.equipment.length) return null;
  const tree = Category.tree(state.categories, null);
  return (
    <div
      style={{
        textTransform: "capitalize",
      }}
    >
      {tree.map(function climb(branch) {
        if (!branch || !equipmentList) {
          return null;
        }
        const contents = Category.hasContents(branch, equipmentList);
        if (!contents) {
          return null;
        }
        const expanded = Category.isChildOfParent(
          state.categories,
          state.currentCategory,
          branch
        );
        return (
          <ExpansionPanel key={branch.id} expanded={expanded}>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={branch.title + "expansionPanel"}
              id={branch.title + "expansionPanel"}
              onClick={(): void =>
                dispatch({
                  type: EquipmentActionTypes.SelectedCategory,
                  payload: { currentCategory: changeCategory(branch) },
                })
              }
            >
                {branch.title + " [" + contents + "]"}
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <List
                style={{
                  flexDirection: "column",
                  minWidth: "100%",
                }}
              >
                {branch.children?.map((twig) => climb(twig))}

                {expanded && (
                  <EquipmentStandardList
                    equipmentList={equipmentList.filter(
                      (item) => item.category.id === branch.id
                    )}
                    selectedEquipment={selectedEquipment}
                    setFieldValue={state.setFieldValue}
                  />
                )}
              </List>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        );
      })}
    </div>
  );
};
export default EquipmentList;
