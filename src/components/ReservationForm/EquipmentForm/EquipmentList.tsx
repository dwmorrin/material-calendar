import React, { FunctionComponent } from "react";
import EquipmentStandardList from "./EquipmentStandardList";
import { EquipmentActionTypes } from "./types";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import List from "@material-ui/core/List";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Category from "../../../resources/Category";
import { EquipmentTable } from "../../../resources/Equipment";
import { EquipmentListProps } from "./types";

const EquipmentList: FunctionComponent<EquipmentListProps> = ({
  categories,
  dispatch,
  equipment,
  selectedEquipment,
  state,
  userRestriction,
}) => {
  const tree = Category.tree(categories, null);
  const itemsByCategory = Object.entries(equipment).reduce(
    (acc, [hash, info]) => {
      if (!(info.category.id in acc))
        acc[info.category.id] = {} as EquipmentTable;
      acc[info.category.id][hash] = info;
      return acc;
    },
    {} as Record<string, EquipmentTable>
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
                    equipment={contents}
                    selectedEquipment={selectedEquipment}
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
