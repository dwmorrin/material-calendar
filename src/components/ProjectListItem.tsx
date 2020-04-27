import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { ListItem, ListItemText, Checkbox } from "@material-ui/core";
import Project from "../calendar/Project";

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
      onClick={(): void =>
        dispatch({
          type: CalendarAction.OpenProjectDashboard,
          payload: { ...state, currentProject: project },
        })
      }
    >
      <Checkbox
        checked={project.selected || false}
        size="small"
        inputProps={{ "aria-label": "checkbox with small size" }}
        key={project.title}
        onClick={(event): void => event.stopPropagation()}
        onChange={(event: React.ChangeEvent<{}>, checked): void => {
          event.stopPropagation();
          dispatch({
            type: CalendarAction.SelectedProject,
            payload: {
              projects: state.projects.map((proj) => {
                if (proj.id !== project.id) {
                  return proj;
                }
                proj.selected = checked;
                return proj;
              }),
            },
          });
        }}
      />
      <ListItemText primary={project.title} />
    </ListItem>
  );
};

export default ProjectListItem;