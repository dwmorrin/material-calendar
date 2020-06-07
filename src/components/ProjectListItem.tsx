import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  Checkbox,
  IconButton,
  ListItem,
  ListItemText,
  Divider,
} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import Project from "../resources/Project";
import { ResourceKey } from "../resources/types";

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
      onClick={(event): void => {
        event.stopPropagation();
        dispatch({
          type: CalendarAction.SelectedProject,
          payload: {
            resources: {
              ...state.resources,
              [ResourceKey.Projects]: state.resources[ResourceKey.Projects].map(
                (proj) => {
                  if (proj.id !== project.id) {
                    return proj;
                  }
                  proj.selected = !proj.selected;
                  return proj;
                }
              ),
            },
          },
        });
      }}
    >
      <Checkbox
        checked={project.selected || false}
        size="small"
        inputProps={{ "aria-label": "checkbox with small size" }}
        key={project.title}
        onClick={(event): void => event.stopPropagation()}
        onChange={(event: React.ChangeEvent, checked): void => {
          event.stopPropagation();
          dispatch({
            type: CalendarAction.SelectedProject,
            payload: {
              resources: {
                ...state.resources,
                [ResourceKey.Projects]: state.resources[
                  ResourceKey.Projects
                ].map((proj) => {
                  if (proj.id !== project.id) {
                    return proj;
                  }
                  proj.selected = checked;
                  return proj;
                }),
              },
            },
          });
        }}
      />
      <ListItemText primary={project.title} />
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
