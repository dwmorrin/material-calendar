import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarUISelectionProps } from "../calendar/types";
import ProjectAccordionList from "./ProjectAccordionList";
import ProjectListItem from "./ProjectListItem";
import { ListItem, Typography } from "@material-ui/core";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Course from "../resources/Course";
import UserGroup from "../resources/UserGroup";

type CourseProjects = Record<number, Project[]>;

const ProjectList: FunctionComponent<
  CalendarUIProps & CalendarUISelectionProps & { invitations: UserGroup[] }
> = ({ dispatch, invitations, state, selections, setSelections }) => {
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const courseProjects = projects.reduce((acc, p) => {
    const {
      course: { id },
    } = p;
    if (!(id in acc)) acc[id] = [p];
    else acc[id].push(p);
    return acc;
  }, {} as CourseProjects);
  return (
    <div>
      {projects.length ? (
        <ListItem>
          <Typography variant="body1">Courses</Typography>
        </ListItem>
      ) : (
        ""
      )}
      {courses &&
        courses.map((course, index) => {
          if (courseProjects[course.id].length > 1)
            return (
              <ProjectAccordionList
                key={`${index}_exp_list`}
                dispatch={dispatch}
                invitations={invitations}
                state={state}
                course={course}
                selections={selections}
                setSelections={setSelections}
              />
            );
          const project = courseProjects[course.id][0];
          return (
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
          );
        })}
    </div>
  );
};
export default ProjectList;
