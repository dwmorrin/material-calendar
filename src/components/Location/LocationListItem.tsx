import React, { FunctionComponent } from "react";
import { CalendarUISelectionProps } from "../../calendar/types";
import {
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import Location from "../../resources/Location";

interface LocationListItemProps {
  location: Location;
}

const LocationListItem: FunctionComponent<
  LocationListItemProps & CalendarUISelectionProps
> = ({ location, selections, setSelections }) => {
  return (
    <ListItem button key={location.id}>
      <FormControlLabel
        control={<Checkbox />}
        label={<ListItemText primary={location.title} />}
        checked={selections.locationIds.includes(location.id)}
        key={location.id}
        onClick={(event): void => event.stopPropagation()}
        onChange={(event: React.ChangeEvent<unknown>, checked): void => {
          event.stopPropagation();
          //dispatchSelectedLocationGroup(state, dispatch, location.id, checked);
          let { locationIds } = selections;
          // checked and not in selections - add
          if (checked && !locationIds.includes(location.id))
            locationIds = [...locationIds, location.id];
          // checked and in selections - do nothing
          // not checked and not in selections - do nothing
          // not checked and in selections - remove
          else if (!checked && locationIds.includes(location.id))
            locationIds = locationIds.filter((id) => id !== location.id);
          setSelections({
            ...selections,
            locationIds,
          });
        }}
      />
    </ListItem>
  );
};

export default LocationListItem;
