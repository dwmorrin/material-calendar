import React, { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CalendarUIProps } from "../calendar/types";
import ProjectExpansionList from "./ProjectExpansionList";
// import ProjectListItem from "./ProjectListItem";
import { Typography } from "@material-ui/core";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Course from "../resources/Course";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

const ProjectList: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const classes = useStyles();
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const courses = state.resources[ResourceKey.Courses] as Course[];
  return (
    <div className={classes.root}>
      {projects.length ? <Typography variant="body1">Projects</Typography> : ""}
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
