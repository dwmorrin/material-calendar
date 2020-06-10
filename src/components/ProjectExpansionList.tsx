import React, { FunctionComponent } from "react";
import { CalendarUIProps } from "../calendar/types";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  List,
  ListItemText,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ProjectListItem from "./ProjectListItem";
import Project from "../resources/Project";
import { dispatchSelectedProjectsByCourse } from "../calendar/dispatch";

interface ProjectExpansionListProps extends CalendarUIProps {
  parentId: string | number;
  projects: Project[];
}

const ProjectExpansionList: FunctionComponent<ProjectExpansionListProps> = ({
  dispatch,
  state,
  parentId,
  projects,
}) => {
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
            dispatchSelectedProjectsByCourse(
              state,
              dispatch,
              parentId as string,
              checked
            );
          }}
        />
      </ExpansionPanelSummary>
      <ExpansionPanelDetails>
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
