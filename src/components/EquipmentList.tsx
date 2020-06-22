import React, { FunctionComponent } from "react";
import Equipment from "../resources/Equipment";
import EquipmentStandardList from "./EquipmentStandardList";
import { EquipmentState, EquipmentAction } from "../equipmentForm/types";
import { makeTree } from "../utils/category";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

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
  equipmentList,
  selectedEquipment,
}) => {
  if (!state.equipment.length) return null;
  const tree = makeTree(state.categories, null);
  return (
    <div>
      {tree.map(function climb(branch) {
        return (
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={branch.title}
              id={branch.title}
            >
              {branch.title}
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <List
                style={{
                  flexDirection: "column",
                  minWidth: "100%",
                }}
              >
                {branch.children.map((twig) => climb(twig))}
              </List>
              <EquipmentStandardList
                equipmentList={equipmentList.filter(
                  (item) => item.category.id == branch.id
                )}
                selectedEquipment={selectedEquipment}
                setFieldValue={state.setFieldValue}
              />
            </ExpansionPanelDetails>
          </ExpansionPanel>
        );
      })}
    </div>
  );
};
export default EquipmentList;
