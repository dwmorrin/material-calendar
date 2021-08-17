import React, { FunctionComponent } from "react";
import { CalendarUIProps, CalendarUISelectionProps } from "../calendar/types";
import ProjectAccordionList from "./ProjectAccordionList";
import { ListItem, Typography } from "@material-ui/core";
import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import Course from "../resources/Course";
import UserGroup from "../resources/UserGroup";

const ProjectList: FunctionComponent<
  CalendarUIProps & CalendarUISelectionProps & { invitations: UserGroup[] }
> = ({ dispatch, invitations, state, selections, setSelections }) => {
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const courses = state.resources[ResourceKey.Courses] as Course[];
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
        courses.map((course, index) => (
          <ProjectAccordionList
            key={`${index}_exp_list`}
            dispatch={dispatch}
            invitations={invitations}
            state={state}
            course={course}
            selections={selections}
            setSelections={setSelections}
          />
        ))}
    </div>
  );
};
export default ProjectList;
