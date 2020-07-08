import React, { FunctionComponent, useContext } from "react";
import { CalendarUIProps } from "../calendar/types";
import ProjectExpansionList from "./ProjectExpansionList";
import { AuthContext } from "./AuthContext";
import { Typography, Button } from "@material-ui/core";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import User from "../resources/User";
import Course from "../resources/Course";
import { CalendarAction } from "../calendar/types";

const ProjectList: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useContext(AuthContext);
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const courses = state.resources[ResourceKey.Courses] as Course[];
  const isManager =
    process.env.NODE_ENV === "development" || User.isManager(user);
  return (
    <div>
      {projects.length ? <Typography variant="body1">Projects</Typography> : ""}
      {isManager && (
        <Button
          onClick={(event): void => {
            event.stopPropagation();
            dispatch({
              type: CalendarAction.OpenProjectForm,
            });
          }}
        >
          Create New Project
        </Button>
      )}
      {courses &&
        courses.map((course, index) => (
          <ProjectExpansionList
            key={`${index}_exp_list`}
            dispatch={dispatch}
            state={state}
            parentId={course.title}
            projects={projects.filter(
              (project) => project.course.title === course.title
            )}
          />
        ))}
    </div>
  );
};
export default ProjectList;
