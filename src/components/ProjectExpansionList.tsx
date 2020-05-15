import React, { FunctionComponent, useContext } from "react";
import { CalendarUIProps, CalendarAction } from "../calendar/types";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  List,
  ListItemText,
  FormControlLabel,
  Checkbox
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import ProjectListItem from "./ProjectListItem";
import { AuthContext } from "./AuthContext";
import Project from "../calendar/Project";

const useStyles = makeStyles(() => ({
  nopadding: {
    padding: 0
  }
}));

interface ProjectExpansionListProps extends CalendarUIProps {
  parentId: string | number;
  projects: Project[];
}

const ProjectExpansionList: FunctionComponent<ProjectExpansionListProps> = ({
  dispatch,
  state,
  parentId,
  projects
}) => {
  const { user } = useContext(AuthContext);
  const classes = useStyles();
  const checked = projects.every((project) => project.selected);
  const indeterminate =
    !checked && projects.some((project) => project.selected);

  return (
    <ExpansionPanel defaultExpanded={projects.length === 1}>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions1-content"
        id="additional-actions1-header"
        onClick={(event): void => event.stopPropagation()}
        onFocus={(event): void => event.stopPropagation()}
      >
        <FormControlLabel
          aria-label="Acknowledge"
          checked={checked}
          control={<Checkbox indeterminate={indeterminate} />}
          label={<ListItemText primary={parentId} />}
          onClick={(event): void => event.stopPropagation()}
          onChange={(event: React.ChangeEvent<{}>, checked): void => {
            event.stopPropagation();
            dispatch({
              type: CalendarAction.SelectedProject,
              payload: {
                projects: state.projects.map((project) => {
                  if (
                    user?.projectIds.includes(project.id) &&
                    project.parentId === parentId
                  ) {
                    project.selected = checked;
                  }
                  return project;
                })
              }
            });
          }}
        />
      </ExpansionPanelSummary>
      <ExpansionPanelDetails classes={{ root: classes.nopadding }}>
        <List>
          {projects.map((project) => (
            <ProjectListItem
              key={project.id}
              dispatch={dispatch}
              state={state}
              project={project}
            />
          ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default ProjectExpansionList;
