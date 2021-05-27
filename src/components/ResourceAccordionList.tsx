import React, { FunctionComponent } from "react";
import { CalendarUIProps } from "../calendar/types";
import {
  Accordion,
  AccordionSummary,
  FormControlLabel,
  AccordionDetails,
  List,
  Checkbox,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ResourceListItem from "./ResourceListItem";
import Location from "../resources/Location";
import { ResourceKey } from "../resources/types";
import { dispatchSelectedLocation } from "../calendar/dispatch";

interface ResourceAccordionListProps extends CalendarUIProps {
  groupId: string;
}
const ResourceAccordionList: FunctionComponent<ResourceAccordionListProps> = ({
  dispatch,
  state,
  groupId,
}) => {
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const groupLocations = locations.filter(
    (location) => location.groupId === groupId
  );
  const checked = groupLocations.every((location) => location.selected);
  const indeterminate =
    !checked && groupLocations.some((location) => location.selected);
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions1-content"
        id="additional-actions1-header"
        onClick={(event): void => event.stopPropagation()}
        onFocus={(event): void => event.stopPropagation()}
      >
        <FormControlLabel
          aria-label="Acknowledge"
          checked={checked}
          control={<Checkbox indeterminate={indeterminate} />}
          label={groupId}
          onClick={(event): void => event.stopPropagation()}
          onChange={(event: React.ChangeEvent<unknown>, checked): void => {
            event.stopPropagation();
            dispatchSelectedLocation(state, dispatch, groupId, checked);
          }}
        />
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {locations
            .filter((location) => location.groupId === groupId)
            .map((location) => (
              <ResourceListItem
                key={location.id}
                dispatch={dispatch}
                state={state}
                location={location}
              />
            ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default ResourceAccordionList;
