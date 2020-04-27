import React, { FunctionComponent, useContext } from "react";
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
import ProjectListItem from "./ProjectListItem";
import { AuthContext } from "./AuthContext";

const useStyles = makeStyles(() => ({
  nopadding: {
    padding: 0,
  },
}));

const ProjectExpansionList: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  const { user } = useContext(AuthContext);
  const classes = useStyles();
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
          {state.projects
            .filter((project) => user?.projectIds.includes(project.id))
            .map((project) => (
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
