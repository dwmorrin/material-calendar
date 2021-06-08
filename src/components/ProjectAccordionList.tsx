import React, { FunctionComponent } from "react";
import { CalendarUIProps } from "../calendar/types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemText,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ProjectListItem from "./ProjectListItem";
import Project from "../resources/Project";
import { dispatchSelectedProjectsByCourse } from "../calendar/dispatch";

interface ProjectAccordionListProps extends CalendarUIProps {
  course: { id: number; title: string };
  projects: Project[];
}

const ProjectAccordionList: FunctionComponent<ProjectAccordionListProps> = ({
  dispatch,
  state,
  course,
  projects,
}) => {
  const checked = projects.every((project) => project.selected);
  const indeterminate =
    !checked && projects.some((project) => project.selected);

  return (
    <Accordion defaultExpanded={projects.length === 1}>
      <AccordionSummary
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
          onChange={(event: React.ChangeEvent<unknown>, checked): void => {
            event.stopPropagation();
            dispatchSelectedProjectsByCourse(
              state,
              dispatch,
              course.title as string,
              checked
            );
          }}
        />
      </AccordionSummary>
      <AccordionDetails>
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
      </AccordionDetails>
    </Accordion>
  );
};

export default ProjectAccordionList;
