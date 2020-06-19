import React, { FunctionComponent } from "react";
import { CalendarUIProps } from "../calendar/types";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  FormControlLabel,
  ExpansionPanelDetails,
  List,
  Checkbox,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ResourceListItem from "./ResourceListItem";
import Location from "../resources/Location";
import { ResourceKey } from "../resources/types";
import { dispatchSelectedLocation } from "../calendar/dispatch";

interface ResourceExpansionListProps extends CalendarUIProps {
  groupId: string;
}
const ResourceExpansionList: FunctionComponent<ResourceExpansionListProps> = ({
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
    <ExpansionPanel>
      <ExpansionPanelSummary
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
          onChange={(event: React.ChangeEvent<{}>, checked): void => {
            event.stopPropagation();
            dispatchSelectedLocation(state, dispatch, groupId, checked);
          }}
        />
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
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
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default ResourceExpansionList;
