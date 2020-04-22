import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { ListItem, ListItemText, Checkbox } from "@material-ui/core";
import Location from "../calendar/Location";

interface ResourceListItemProps extends CalendarUIProps {
  location: Location;
}

const ResourceListItem: FunctionComponent<ResourceListItemProps> = ({
  dispatch,
  state,
  location,
}) => {
  return (
    <ListItem button key={location.id}>
      <Checkbox
        checked={location.selected}
        size="small"
        inputProps={{ "aria-label": "checkbox with small size" }}
        key={location.id}
        onClick={(event): void => event.stopPropagation()}
        onChange={(event: React.ChangeEvent<{}>, checked): void => {
          event.stopPropagation();
          dispatch({
            type: CalendarAction.SelectedLocation,
            payload: {
              locations: state.locations.map((loc) => {
                if (loc.id !== location.id) {
                  return loc;
                }
                loc.selected = checked;
                return loc;
              }),
            },
          });
        }}
      />
      <ListItemText primary={location.title} />
    </ListItem>
  );
};

export default ResourceListItem;
