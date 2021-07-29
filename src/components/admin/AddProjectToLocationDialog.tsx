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
      values as { [title: string]: boolean }
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
        if (error)
          return dispatch({ type: AdminAction.Error, payload: { error } });
        dispatch({
          type: AdminAction.AddProjectToLocationSuccess,
          payload: {
            resources: {
              ...state.resources,
              [ResourceKey.Projects]: (data.projects as Project[]).map(
                (p) => new Project(p)
              ),
              [ResourceKey.Locations]: (data.locations as Location[]).map(
                (l) => new Location(l)
              ),
            },
          },
        });
      })
      .catch((err) => {
        dispatch({ type: AdminAction.Error, payload: { error: err } });
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
      <DialogTitle>Add Project to Location</DialogTitle>
      <DialogContent>
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
                <Button onClick={(): void => handleSubmit()}>OK</Button>
              </DialogActions>
            </List>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectToLocation;
