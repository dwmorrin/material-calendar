import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarUISelectionProps } from "../calendar/types";
import LocationListItem from "./LocationListItem";
import LocationAccordionList from "./LocationAccordionList";
import { AccordionSummary, Accordion } from "@material-ui/core";
import { ResourceKey } from "../resources/types";
import Location from "../resources/Location";

interface LocationGroups {
  [k: string]: Location[];
}

const locationGroupReducer = (
  groups: LocationGroups | undefined,
  location: Location
): LocationGroups | undefined => {
  if (!location.groupId) {
    return groups;
  }
  if (groups) {
    if (!groups[location.groupId]) {
      groups[location.groupId] = [location];
      return groups;
    }
    groups[location.groupId].push(location);
    return groups;
  }
};

const LocationList: FunctionComponent<
  CalendarUIProps & CalendarUISelectionProps
> = ({ dispatch, state, selections, setSelections }) => {
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const groups = locations.reduce(locationGroupReducer, {});
  const singletons = locations.filter((location) => !location.groupId);
  return (
    <div>
      {groups &&
        Object.keys(groups).map((key) => (
          <LocationAccordionList
            key={`${key}_exp_list`}
            dispatch={dispatch}
            state={state}
            groupId={key}
            selections={selections}
            setSelections={setSelections}
          />
        ))}
      {singletons.map((location) => (
        <Accordion key={`${location.id}_list_item`}>
          <AccordionSummary style={{ padding: 0 }}>
            <LocationListItem
              location={location}
              selections={selections}
              setSelections={setSelections}
            />
          </AccordionSummary>
        </Accordion>
      ))}
    </div>
  );
};
export default LocationList;
