import React, {
  FunctionComponent,
  useEffect,
  useContext,
  useState,
} from "react";
import { CalendarUIProps } from "../calendar/types";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  List,
  ListItemText,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles } from "@material-ui/core/styles";
import { AuthContext } from "./AuthContext";
import Project from "../calendar/Project";
import ProjectListItem from "./ProjectListItem";

const useStyles = makeStyles(() => ({
  nopadding: {
    padding: 0,
  },
}));

const ProjectExpansionList: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const initalProjects: Project[] = [];
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState(initalProjects);
  const classes = useStyles();

  useEffect(() => {
    if (!user?.projectIds) return;
    fetch(`/api/projects/${user.id}`)
      .then((response) => response.json())
      .then(setProjects)
      .catch(console.error);
  }, [user]);
  return (
    <ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions1-content"
        id="additional-actions1-header"
        onClick={(event): void => event.stopPropagation()}
        onFocus={(event): void => event.stopPropagation()}
      >
        <ListItemText primary="Projects" />
      </ExpansionPanelSummary>
      <ExpansionPanelDetails classes={{ root: classes.nopadding }}>
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
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

export default ProjectExpansionList;
