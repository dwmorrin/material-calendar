import React, { FC } from "react";
import {
  CalendarAction,
  CalendarUIProps,
  CalendarUISelectionProps,
} from "../calendar/types";
import {
  Checkbox,
  Grid,
  IconButton,
  ListItem,
  ListItemText,
  FormControlLabel,
  Badge,
} from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import Project from "../resources/Project";

interface ProjectListItemProps extends CalendarUIProps {
  project: Project;
  invitations: number;
}

const ProjectListItem: FC<ProjectListItemProps & CalendarUISelectionProps> = ({
  dispatch,
  state,
  project,
  selections,
  setSelections,
  invitations,
}) => {
  const toggleProjectSelected = (
    event: React.ChangeEvent<unknown>,
    checked: boolean
  ): void => {
    event.stopPropagation();
    const { projectIds } = selections;
    if (checked && !projectIds.includes(project.id))
      setSelections({ ...selections, projectIds: [...projectIds, project.id] });
    else if (!checked && projectIds.includes(project.id))
      setSelections({
        ...selections,
        projectIds: projectIds.filter((id) => id !== project.id),
      });
  };

  const openProjectDashboard = (event: React.MouseEvent): void => {
    event.stopPropagation();
    dispatch({
      type: CalendarAction.OpenProjectDashboard,
      payload: { ...state, currentProject: project },
    });
  };

  return (
    <ListItem
      button
      key={project.id}
      onClick={(event): void => event.stopPropagation()}
    >
      <Grid container justify="space-between">
        <Grid item xs={9}>
          <FormControlLabel
            checked={selections.projectIds.includes(project.id)}
            control={<Checkbox />}
            label={<ListItemText primary={project.title} />}
            onClick={(event): void => event.stopPropagation()}
            onChange={toggleProjectSelected}
          />
        </Grid>
        <Grid item>
          <IconButton key={project.id} onClick={openProjectDashboard}>
            <Badge color="secondary" badgeContent={invitations}>
              <InfoIcon color="primary" />
            </Badge>
          </IconButton>
        </Grid>
      </Grid>
    </ListItem>
  );
};

export default ProjectListItem;
