import React, { FunctionComponent } from "react";
import {
  CalendarAction,
  CalendarUIProps,
  CalendarUISelectionProps,
} from "../calendar/types";
import {
  Checkbox,
  IconButton,
  ListItem,
  ListItemText,
  Divider,
  FormControlLabel,
  Badge,
} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import Project from "../resources/Project";

interface ProjectListItemProps extends CalendarUIProps {
  project: Project;
  invitations: number;
}

const ProjectListItem: FunctionComponent<
  ProjectListItemProps & CalendarUISelectionProps
> = ({ dispatch, state, project, selections, setSelections, invitations }) => {
  return (
    <ListItem
      button
      key={project.id}
      onClick={(event): void => event.stopPropagation()}
    >
      <FormControlLabel
        checked={selections.projectIds.includes(project.id)}
        control={<Checkbox />}
        label={<ListItemText primary={project.title} />}
        onClick={(event): void => event.stopPropagation()}
        onChange={(event: React.ChangeEvent<unknown>, checked): void => {
          event.stopPropagation();
          let { projectIds } = selections;
          // checked and not in selections - add
          if (checked && !projectIds.includes(project.id))
            projectIds = [...projectIds, project.id];
          // checked and in selections - do nothing
          // not checked and not in selections - do nothing
          // not checked and in selections - remove
          else if (!checked && projectIds.includes(project.id))
            projectIds = projectIds.filter((id) => id !== project.id);
          setSelections({
            ...selections,
            projectIds,
          });
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
        <Badge color="secondary" badgeContent={invitations}>
          <InfoIcon />
        </Badge>
      </IconButton>
    </ListItem>
  );
};

export default ProjectListItem;
