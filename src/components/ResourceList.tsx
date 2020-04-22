import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CalendarUIProps } from "../calendar/types";
import { locationGroupReducer } from "../calendar/Location";
import ResourceListItem from "./ResourceListItem";
import ResourceExpansionList from "./ResourceExpansionList";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

const ResourceList: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const locations = state.locations;
  const groups = locations.reduce(locationGroupReducer, {});
  const singletons = locations.filter((location) => !location.groupId);
  const classes = useStyles();
  return (
    <div className={classes.root}>
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
        <ResourceListItem
          key={`${location.id}_list_item`}
          dispatch={dispatch}
          state={state}
          location={location}
        />
      ))}
    </div>
  );
};
export default ResourceList;
