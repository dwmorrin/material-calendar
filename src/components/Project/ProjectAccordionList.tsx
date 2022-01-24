import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarUISelectionProps } from "../types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  List,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Badge,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ProjectListItem from "./ProjectListItem";
import Project from "../../resources/Project";
import UserGroup from "../../resources/UserGroup";
import { ResourceKey } from "../../resources/types";

interface ProjectAccordionListProps extends CalendarUIProps {
  invitations: UserGroup[];
  course: { id: number; title: string };
}

const ProjectAccordionList: FunctionComponent<
  ProjectAccordionListProps & CalendarUISelectionProps
> = ({ dispatch, invitations, state, course, selections, setSelections }) => {
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const courseProjects = projects.filter(
    (p) => p.course.title === course.title
  );
  // const checked = courseProjects.every(({ id }) =>
  //   selections.projectIds.includes(id)
  // );
  // const indeterminate =
  //   !checked &&
  //   courseProjects.some(({ id }) => selections.projectIds.includes(id));

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions1-content"
        id="additional-actions1-header"
        onClick={(event): void => event.stopPropagation()}
        onFocus={(event): void => event.stopPropagation()}
      >
        <Grid container justify="space-between">
          <Grid item>
            <ListItemText primary={course.title} />
            {/* <FormControlLabel
              aria-label="Acknowledge"
              checked={checked}
              control={<Checkbox indeterminate={indeterminate} />}
              label={<ListItemText primary={course.title} />}
              onClick={(event): void => event.stopPropagation()}
              onChange={(event: React.ChangeEvent<unknown>, checked): void => {
                event.stopPropagation();
                let { projectIds } = selections;
                // checked: make sure all course projects are in selections
                if (checked) {
                  courseProjects.forEach((p) => {
                    if (!projectIds.includes(p.id))
                      projectIds = [...projectIds, p.id];
                  });
                }
                // not checked: filter out all course projects
                if (!checked)
                  projectIds = projectIds.filter(
                    (id) => !courseProjects.find((p) => id === p.id)
                  );
                setSelections({
                  ...selections,
                  projectIds,
                });
              }}
            /> */}
          </Grid>
          <Grid item>
            <Badge
              color="secondary"
              badgeContent={
                invitations.filter(({ projectId }) =>
                  courseProjects.some(({ id }) => id === projectId)
                ).length
              }
            />
          </Grid>
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          {courseProjects.map((project) => (
            <ProjectListItem
              key={project.id}
              dispatch={dispatch}
              state={state}
              project={project}
              selections={selections}
              setSelections={setSelections}
              invitations={
                invitations.filter(({ projectId }) => projectId === project.id)
                  .length
              }
            />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default ProjectAccordionList;
