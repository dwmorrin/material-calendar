import React, { FC } from "react";
import { CalendarUIProps, CalendarUISelectionProps } from "../types";
import ProjectAccordionList from "./ProjectAccordionList";
import ProjectListItem from "./ProjectListItem";
import { ListItem, Typography } from "@material-ui/core";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";
import Course from "../../resources/Course";
import UserGroup from "../../resources/UserGroup";
import { useAuth } from "../AuthProvider";

type CourseProjects = Record<number, Project[]>;

const ProjectList: FC<
  CalendarUIProps & CalendarUISelectionProps & { invitations: UserGroup[] }
> = ({ dispatch, invitations, state, selections, setSelections }) => {
  const { user } = useAuth();
  const isInstructor = user.roles.includes("instructor");
  const projects = (state.resources[ResourceKey.Projects] as Project[]).filter(
    ({ title }) => title !== Project.walkInTitle
  );
  const courses = (state.resources[ResourceKey.Courses] as Course[]).filter(
    ({ title }) => title !== Project.walkInTitle
  );

  const classMeetingProject = projects.find((p) =>
    p.title.startsWith(Project.classMeetingTitlePrefix)
  );

  let courseProjects: CourseProjects = {};

  //! TEMPORARY HACK - needs to fix display of course/project to instructors
  if (isInstructor) {
    courseProjects = courses.reduce((acc, c) => {
      if (classMeetingProject) acc[c.id] = [classMeetingProject];
      return acc;
    }, {} as CourseProjects);
  } else {
    courseProjects = projects.reduce((acc, p) => {
      const {
        course: { id },
      } = p;
      if (!(id in acc)) acc[id] = [p];
      else acc[id].push(p);
      return acc;
    }, {} as CourseProjects);
  }

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
