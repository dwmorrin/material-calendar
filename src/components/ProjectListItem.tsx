import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  Checkbox,
  IconButton,
  ListItem,
  ListItemText,
  Divider,
  FormControlLabel,
} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import Project from "../resources/Project";
import { dispatchSelectedProject } from "../calendar/dispatch";

interface ProjectListItemProps extends CalendarUIProps {
  project: Project;
}

const ProjectListItem: FunctionComponent<ProjectListItemProps> = ({
  dispatch,
  state,
  project,
}) => {
  return (
    <ListItem
      button
      key={project.id}
      onClick={(event): void => event.stopPropagation()}
    >
      <FormControlLabel
        //TODO state should track selected Projects (removed project.selected)
        checked={false}
        control={<Checkbox />}
        label={<ListItemText primary={project.title} />}
        onClick={(event): void => event.stopPropagation()}
        onChange={(event: React.ChangeEvent<unknown>, checked): void => {
          event.stopPropagation();
          dispatchSelectedProject(state, dispatch, project.id, checked);
        }}
      />
      <Divider orientation="vertical" flexItem />
      <IconButton
        key={project.id}
        onClick={(event): void => {
          event.stopPropagation();
          dispatch({
            type: CalendarAction.OpenProjectDashboard,
            payload: { ...state, currentProject: project },
          });
        }}
      >
        <InfoIcon />
      </IconButton>
    </ListItem>
  );
};

export default ProjectListItem;
