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
import { makeStyles } from "@material-ui/core/styles";
import Location from "../resources/Location";
import { ResourceKey } from "../resources/types";

const useStyles = makeStyles(() => ({
  nopadding: {
    padding: 0,
  },
}));

interface ResourceExpansionListProps extends CalendarUIProps {
  groupId: string;
}
const ResourceExpansionList: FunctionComponent<ResourceExpansionListProps> = ({
  dispatch,
  state,
  groupId,
}) => {
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const classes = useStyles();
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
            dispatch({
              type: CalendarAction.SelectedLocation,
              payload: {
                resources: {
                  ...state.resources,
                  [ResourceKey.Locations]: locations.map((location) => {
                    if (location.groupId !== groupId) {
                      return location;
                    }
                    location.selected = checked;
                    return location;
                  }),
                },
              },
            });
          }}
        />
      </ExpansionPanelSummary>
      <ExpansionPanelDetails classes={{ root: classes.nopadding }}>
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
