import React, { FC } from "react";
import {
  AdminAction,
  AdminSelectionProps,
  AdminUIProps,
} from "../../admin/types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Toolbar,
} from "@material-ui/core";
import { Field, Formik } from "formik";
import { CheckboxWithLabel } from "formik-material-ui";
import CloseIcon from "@material-ui/icons/Close";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";
import Location from "../../resources/Location";
import VirtualWeek from "../../resources/VirtualWeek";

const AddProjectToLocation: FC<AdminUIProps & AdminSelectionProps> = ({
  state,
  dispatch,
  selections,
}) => {
  const { resources } = state;
  const { locationId } = selections;
  if (!locationId) return null;

  const projectsNotInLocation = (
    resources[ResourceKey.Projects] as Project[]
  ).filter(
    ({ title, locationHours }) =>
      title !== Project.walkInTitle &&
      !locationHours.some(({ locationId: id }) => id === locationId)
  );

  const close = (): void =>
    dispatch({ type: AdminAction.CloseAddProjectToLocation });

  interface ProjectLocationHours {
    project: string; // title
    locationId: number;
    hours: number;
  }

  const onSubmit = (values: Record<string, unknown>): void => {
    const selectedProjects = Object.entries(
      values as Record<string, boolean>
    ).reduce(
      (locationHours, [title, selected]) =>
        selected
          ? [...locationHours, { project: title, locationId, hours: 0 }]
          : locationHours,
      [] as ProjectLocationHours[]
    );

    if (!selectedProjects.length) return close();

    fetch(`${Project.url}/location-hours`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(selectedProjects),
    })
      .then((res) => res.json())
      .then(({ error, data }) => {
        if (error) throw error;
        const projects: Project[] = data.projects;
        const locations: Location[] = data.locations;
        const weeks: VirtualWeek[] = data.weeks;
        if (![projects, locations, weeks].every((a) => Array.isArray(a)))
          throw new Error(
            "missing updated project, location, or week after adding project"
          );
        dispatch({
          type: AdminAction.AddProjectToLocationSuccess,
          payload: {
            resources: {
              ...state.resources,
              [ResourceKey.Projects]: projects.map((p) => new Project(p)),
              [ResourceKey.Locations]: locations.map((l) => new Location(l)),
              [ResourceKey.VirtualWeeks]: weeks.map((w) => new VirtualWeek(w)),
            },
          },
        });
      })
      .catch((error) => {
        dispatch({ type: AdminAction.Error, payload: { error } });
      });
  };

  return (
    <Dialog open={state.addProjectToLocationIsOpen}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={close}
        >
          <CloseIcon />
        </IconButton>
      </Toolbar>
      <DialogTitle>Add Projects to Location</DialogTitle>
      <DialogContent>
        {projectsNotInLocation.length ? (
          <Formik
            initialValues={projectsNotInLocation.reduce(
              (titles, { title }) => ({ ...titles, [title]: false }),
              {}
            )}
            onSubmit={onSubmit}
          >
            {({ handleSubmit }): unknown => (
              <List>
                {projectsNotInLocation.map(({ id, title }) => (
                  <ListItem key={`project-location-checkbox-${id}`}>
                    <Field
                      Label={{ label: title }}
                      type="checkbox"
                      name={title}
                      component={CheckboxWithLabel}
                    />
                  </ListItem>
                ))}
                <DialogActions>
                  <Button variant="contained" color="secondary" onClick={close}>
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(): void => handleSubmit()}
                  >
                    Add projects
                  </Button>
                </DialogActions>
              </List>
            )}
          </Formik>
        ) : (
          <>
            <p>(No available projects found.)</p>
            <DialogActions>
              <Button
                onClick={(): void =>
                  dispatch({
                    type: AdminAction.SelectedResource,
                    payload: { resourceKey: ResourceKey.Projects },
                  })
                }
              >
                Create a new project
              </Button>
            </DialogActions>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectToLocation;
