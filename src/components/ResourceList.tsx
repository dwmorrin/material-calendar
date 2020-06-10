import React, { FunctionComponent } from "react";
import { CalendarUIProps } from "../calendar/types";
import { locationGroupReducer } from "../resources/Location";
import ResourceListItem from "./ResourceListItem";
import ResourceExpansionList from "./ResourceExpansionList";
import { ExpansionPanelSummary, ExpansionPanel } from "@material-ui/core";
import { ResourceKey } from "../resources/types";
import Location from "../resources/Location";

const ResourceList: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const groups = locations.reduce(locationGroupReducer, {});
  const singletons = locations.filter((location) => !location.groupId);
  return (
    <div>
      {groups &&
        Object.keys(groups).map((key) => (
          <ResourceExpansionList
            key={`${key}_exp_list`}
            dispatch={dispatch}
            state={state}
            groupId={key}
          />
        ))}
      {singletons.map((location) => (
        <ExpansionPanel key={`${location.id}_list_item`}>
          <ExpansionPanelSummary style={{ padding: 0 }}>
            <ResourceListItem
              dispatch={dispatch}
              state={state}
              location={location}
            />
          </ExpansionPanelSummary>
        </ExpansionPanel>
      ))}
    </div>
  );
};
export default ResourceList;
