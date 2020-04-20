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
          control={<Checkbox />}
          label={groupId}
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
