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
  reserveEquipment: (id: number, quantity: number) => void;
  equipmentList: Equipment[] | undefined;
  selectedEquipment: {
    [k: string]: {
      quantity: number;
      items?: { id: number; quantity: number }[];
    };
  };
}
const EquipmentList: FunctionComponent<EquipmentListProps> = ({
  state,
  dispatch,
  equipmentList,
  selectedEquipment,
  reserveEquipment,
}) => {
  const tree = Category.tree(state.categories, null);
  if (!state.equipment.length) return null;
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
        const expanded =
          state.categoryPath.find((entry) => entry.id === branch.id) !==
          undefined;
        return (
          <ExpansionPanel key={branch.id} expanded={expanded}>
            <ExpansionPanelSummary
              expandIcon={
                state.categoryDrawerView ? (
                  branch.children && branch.children.length > 0 ? (
                    <ExpandMoreIcon
                      onClick={(event): void => {
                        event.stopPropagation();
                        dispatch({
                          type: EquipmentActionTypes.ViewCategory,
                          payload: {
                            selectedCategory: branch,
                          },
                        });
                      }}
                    />
                  ) : null
                ) : (
                  <ExpandMoreIcon />
                )
              }
              aria-controls={branch.title + "expansionPanel"}
              id={branch.title + "expansionPanel"}
              onClick={(): void =>
                dispatch({
                  type: EquipmentActionTypes.SelectCategory,
                  payload: { selectedCategory: branch },
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

                {!state.categoryDrawerView && expanded && (
                  <EquipmentStandardList
                    equipmentList={equipmentList.filter(
                      (item) => item.category.id === branch.id
                    )}
                    selectedEquipment={selectedEquipment}
                    setFieldValue={state.setFieldValue}
                    reserveEquipment={reserveEquipment}
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
