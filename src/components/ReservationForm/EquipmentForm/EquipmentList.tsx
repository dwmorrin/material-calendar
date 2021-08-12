import React, { FunctionComponent } from "react";
import EquipmentStandardList from "./EquipmentStandardList";
import {
  EquipmentAction,
  EquipmentActionTypes,
  EquipmentState,
  EquipmentValue,
} from "./types";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Category from "../../../resources/Category";

interface EquipmentListProps {
  state: EquipmentState;
  categories: Category[];
  dispatch: (action: EquipmentAction) => void;
  selectedEquipment: {
    [k: string]: EquipmentValue;
  };
  userRestriction: number;
}
const EquipmentList: FunctionComponent<EquipmentListProps> = ({
  state,
  dispatch,
  selectedEquipment,
  userRestriction,
  categories,
}) => {
  const tree = Category.tree(categories, null);
  const itemsByCategory = Object.entries(selectedEquipment).reduce(
    (acc, [hash, info]) => {
      if (!(info.category.id in acc))
        acc[info.category.id] = {} as Record<string, EquipmentValue>;
      acc[info.category.id][hash] = info;
      return acc;
    },
    {} as Record<string, Record<string, EquipmentValue>>
  );
  return (
    <div
      style={{
        textTransform: "capitalize",
      }}
    >
      {tree.map(function climb(branch) {
        if (!branch) {
          return null;
        }
        const contents = itemsByCategory[branch.id];
        if (!contents) {
          return null;
        }
        const contentsLength = Object.keys(contents).length;
        const expanded =
          state.categoryPath.find((entry) => entry.id === branch.id) !==
          undefined;
        return (
          <Accordion key={branch.id} expanded={expanded}>
            <AccordionSummary
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
              aria-controls={branch.title + "Accordion"}
              id={branch.title + "Accordion"}
              onClick={(): void =>
                dispatch({
                  type: EquipmentActionTypes.SelectCategory,
                  payload: { selectedCategory: branch },
                })
              }
            >
              {`${branch.title} (${contentsLength})`}
            </AccordionSummary>
            <AccordionDetails>
              <List
                style={{
                  flexDirection: "column",
                  minWidth: "100%",
                }}
              >
                {branch.children?.map((twig) => climb(twig))}

                {!state.categoryDrawerView && expanded && (
                  <EquipmentStandardList
                    selectedEquipment={contents}
                    setFieldValue={state.setFieldValue}
                    userRestriction={userRestriction}
                  />
                )}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
};
export default EquipmentList;
