import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import { ListItem, ListItemText } from "@material-ui/core";
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
      <ListItemText primary={project.title} />
    </ListItem>
  );
};

export default ProjectListItem;
