import React, { FunctionComponent } from "react";
import { CalendarUIProps } from "../calendar/types";
import {
  ListItem,
  ListItemText,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import Location from "../resources/Location";
import { dispatchSelectedLocationGroup } from "../calendar/dispatch";

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
      <FormControlLabel
        control={<Checkbox />}
        label={<ListItemText primary={location.title} />}
        checked={location.selected || false}
        key={location.id}
        onClick={(event): void => event.stopPropagation()}
        onChange={(event: React.ChangeEvent<unknown>, checked): void => {
          event.stopPropagation();
          dispatchSelectedLocationGroup(state, dispatch, location.id, checked);
        }}
      />
    </ListItem>
  );
};

export default ResourceListItem;
