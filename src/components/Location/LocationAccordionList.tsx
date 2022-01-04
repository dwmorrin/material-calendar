import React, { FunctionComponent } from "react";
import {
  CalendarUIProps,
  CalendarUISelectionProps,
} from "../../calendar/types";
import {
  Accordion,
  AccordionSummary,
  FormControlLabel,
  AccordionDetails,
  List,
  Checkbox,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import LocationListItem from "./LocationListItem";
import Location from "../../resources/Location";
import { ResourceKey } from "../../resources/types";

interface LocationAccordionListProps extends CalendarUIProps {
  groupId: string;
}

const LocationAccordionList: FunctionComponent<
  LocationAccordionListProps & CalendarUISelectionProps
> = ({ state, groupId, selections, setSelections }) => {
  const locations = state.resources[ResourceKey.Locations] as Location[];
  const groupLocations = locations.filter(
    (location) => location.groupId === groupId
  );
  const checked = groupLocations.every(({ id }) =>
    selections.locationIds.includes(id)
  );
  const indeterminate =
    !checked &&
    groupLocations.some(({ id }) => selections.locationIds.includes(id));
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
            setSelections({
              ...selections,
              locationIds: locations.reduce((newIds, location) => {
                // see if this location is a member of the group
                if (location.groupId === groupId)
                  return checked ? [...newIds, location.id] : newIds;
                // not a member of the group. copy existing locationIds
                return selections.locationIds.includes(location.id)
                  ? [...newIds, location.id]
                  : newIds;
              }, [] as number[]),
            });
          }}
        />
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {locations
            .filter((location) => location.groupId === groupId)
            .map((location) => (
              <LocationListItem
                key={location.id}
                location={location}
                selections={selections}
                setSelections={setSelections}
              />
            ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default LocationAccordionList;
