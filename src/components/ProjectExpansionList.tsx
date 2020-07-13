import React, { FunctionComponent, useContext } from "react";
import { CalendarUIProps } from "../calendar/types";
import {
  Button,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  List,
  ListItemText,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { AuthContext } from "./AuthContext";
import ProjectListItem from "./ProjectListItem";
import Project from "../resources/Project";
import { dispatchSelectedProjectsByCourse } from "../calendar/dispatch";
import { CalendarAction } from "../calendar/types";

interface ProjectExpansionListProps extends CalendarUIProps {
  course: { id: number; title: string };
  projects: Project[];
}

const ProjectExpansionList: FunctionComponent<ProjectExpansionListProps> = ({
  dispatch,
  state,
  course,
  projects,
}) => {
  const { user } = useContext(AuthContext);
  const checked = projects.every((project) => project.selected);
  const indeterminate =
    !checked && projects.some((project) => project.selected);
  const isManager =
    process.env.NODE_ENV === "development" ||
    projects[0].managers.some((manager) => manager.id === user?.id);

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
          label={<ListItemText primary={course.title} />}
          onClick={(event): void => event.stopPropagation()}
          onChange={(event: React.ChangeEvent<{}>, checked): void => {
            event.stopPropagation();
            dispatchSelectedProjectsByCourse(
              state,
              dispatch,
              course.title as string,
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
          {isManager && (
            <Button
              variant="outlined"
              onClick={(event): void => {
                event.stopPropagation();
                dispatch({
                  type: CalendarAction.OpenProjectForm,
                  payload: { currentCourse: course },
                });
              }}
            >
              New Project
            </Button>
          )}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default ProjectExpansionList;
