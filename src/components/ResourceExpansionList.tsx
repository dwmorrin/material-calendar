import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
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

interface ResourceExpansionListProps extends CalendarUIProps {
  groupId: string;
}
const ResourceExpansionList: FunctionComponent<ResourceExpansionListProps> = ({
  dispatch,
  state,
  groupId,
}) => {
  const { locations } = state;

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
          checked={state.locations
            .filter((location) => location.groupId === groupId)
            .every((location) => location.selected)}
          control={<Checkbox />}
          label={groupId}
          onClick={(event): void => event.stopPropagation()}
          onChange={(event: React.ChangeEvent<{}>, checked): void => {
            event.stopPropagation();
            dispatch({
              type: CalendarAction.SelectedLocation,
              payload: {
                locations: state.locations.map((location) => {
                  if (location.groupId !== groupId) {
                    return location;
                  }
                  location.selected = checked;
                  return location;
                }),
              },
            });
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
