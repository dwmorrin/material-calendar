import React, { FunctionComponent, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { CalendarUIProps } from "../calendar/types";
import { projectGroupReducer } from "../calendar/Project";
import ProjectExpansionList from "./ProjectExpansionList";
import ProjectListItem from "./ProjectListItem";
import { AuthContext } from "./AuthContext";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
});

const ProjectList: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useContext(AuthContext);
  const projects = state.projects.filter((project) =>
    user?.projectIds.includes(project.id)
  );
  const groups = projects.reduce(projectGroupReducer, {});
  const singletons = projects.filter((project) => !project.parentId);
  const classes = useStyles();
  return (
    <div className={classes.root}>
      {projects.length ? <Typography variant="body1">Projects</Typography> : ""}
      {groups &&
        Object.keys(groups).map((key) => (
          <ProjectExpansionList
            key={`${key}_exp_list`}
            dispatch={dispatch}
            state={state}
            parentId={key}
            projects={projects.filter((project) => project.parentId === key)}
          />
        ))}
      {singletons.map((project) => (
        <ProjectListItem
          key={`${project.id}_list_item`}
          dispatch={dispatch}
          state={state}
          project={project}
        />
      ))}
    </div>
  );
};
export default ProjectList;
