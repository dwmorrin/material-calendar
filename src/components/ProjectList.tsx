import React, { FunctionComponent } from "react";
import { CalendarUIProps } from "../calendar/types";
import ProjectExpansionList from "./ProjectExpansionList";
import { Typography } from "@material-ui/core";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Course from "../resources/Course";

const ProjectList: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const courses = state.resources[ResourceKey.Courses] as Course[];
  return (
    <div>
      {projects.length ? <Typography variant="body1">Projects</Typography> : ""}
      {courses &&
        courses.map((course, index) => (
          <ProjectExpansionList
            key={`${index}_exp_list`}
            dispatch={dispatch}
            state={state}
            course={course}
            projects={projects.filter(
              (project) => project.course.title === course.title
            )}
          />
        ))}
    </div>
  );
};
export default ProjectList;
