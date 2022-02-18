import React, { FC } from "react";
import { CalendarUIProps, CalendarUISelectionProps } from "../types";
import ProjectAccordionList from "./ProjectAccordionList";
import ProjectListItem from "./ProjectListItem";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";
import Course from "../../resources/Course";
import UserGroup from "../../resources/UserGroup";
import { useAuth } from "../AuthProvider";
import SchoolIcon from "@material-ui/icons/School";

type CourseProjects = Record<number, Project[] | undefined>;

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

  let courseProjects: CourseProjects = {};

  //! TEMPORARY HACK - needs to fix display of course/project to instructors
  // TODO - give instructors a way to view courses/projects
  // instructors just get no course projects for now
  // adding checks for undefined, but this needs a review
  if (!isInstructor) {
    courseProjects = projects.reduce((acc, p) => {
      const {
        course: { id },
      } = p;
      if (!(id in acc)) acc[id] = [p];
      else if (Array.isArray(acc[id])) {
        (acc[id] as Project[]).push(p);
      }
      return acc;
    }, {} as CourseProjects);
  }

  return (
    <div>
      {projects.length ? (
        <ListItem>
          <ListItemIcon>
            <SchoolIcon />
          </ListItemIcon>
          {/* <Typography variant="h4">Courses</Typography> */}
          <ListItemText primary="Courses" />
        </ListItem>
      ) : (
        ""
      )}
      {courses &&
        courses.map((course, index) => {
          const tbd = courseProjects[course.id];
          if (!Array.isArray(tbd) || !tbd.length) return null;
          if (tbd.length > 1)
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
          const project = tbd[0];
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
