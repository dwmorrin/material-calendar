import React, { FunctionComponent, useContext } from "react";
import { CalendarUIProps, CalendarUISelectionProps } from "../calendar/types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemText,
  FormControlLabel,
  Checkbox,
  Badge,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ProjectListItem from "./ProjectListItem";
import Project from "../resources/Project";
import { ResourceKey } from "../resources/types";
import { AuthContext } from "./AuthContext";

interface ProjectAccordionListProps extends CalendarUIProps {
  course: { id: number; title: string };
}

const ProjectAccordionList: FunctionComponent<
  ProjectAccordionListProps & CalendarUISelectionProps
> = ({ dispatch, state, course, selections, setSelections }) => {
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const courseProjects = projects.filter(
    (p) => p.course.title === course.title
  );
  const checked = courseProjects.every(({ id }) =>
    selections.projectIds.includes(id)
  );
  const indeterminate =
    !checked &&
    courseProjects.some(({ id }) => selections.projectIds.includes(id));

  const { user } = useContext(AuthContext);
  const unansweredInvitations =
    state.invitations?.filter(function (invitation) {
      // Get Invitations where user has yet to respond
      const u = invitation.invitees.find((invitee) => invitee.id === user.id);
      if (u?.accepted == 0 && u.rejected === 0) return true;
      else return false;
    }) || [];

  return (
    <Accordion defaultExpanded={courseProjects.length === 1}>
      <Badge
        color="secondary"
        badgeContent={
          unansweredInvitations.filter((invitation) =>
            courseProjects.some((project) => project.id === invitation.project)
          ).length
        }
      >
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
          />
        </AccordionSummary>
      </Badge>
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
                unansweredInvitations.filter(
                  (invitation) => invitation.project === project.id
                ).length
              }
            />
          ))}
        </List>
      </AccordionDetails>
    </Accordion>
  );
};

export default ProjectAccordionList;
