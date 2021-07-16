import React, { FC } from "react";
import { AdminAction, AdminUIProps } from "../../admin/types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Toolbar,
} from "@material-ui/core";
import { Field, Formik } from "formik";
import { CheckboxWithLabel } from "formik-material-ui";
import CloseIcon from "@material-ui/icons/Close";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";

const AddProjectToLocation: FC<AdminUIProps> = ({ state, dispatch }) => {
  const { resources, schedulerLocationId } = state;
  if (!schedulerLocationId) return null;

  const projectsNotInLocation = (
    resources[ResourceKey.Projects] as Project[]
  ).filter(
    ({ title, locationHours }) =>
      title !== Project.walkInTitle &&
      !locationHours.some(
        ({ locationId }) => locationId === schedulerLocationId
      )
  );
  return (
    <Dialog open={state.addProjectToLocationIsOpen}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="close"
          onClick={(): void =>
            dispatch({ type: AdminAction.CloseAddProjectToLocation })
          }
        >
          <CloseIcon />
        </IconButton>
      </Toolbar>
      <DialogTitle>Add Project to Location</DialogTitle>
      <DialogContent>
        <Formik initialValues={{}} onSubmit={(): void => undefined}>
          {({ handleSubmit, values }): unknown => (
            <>
              {projectsNotInLocation.map(({ id, title }) => (
                <Field
                  key={`project-location-checkbox-${id}`}
                  Label={{ label: title }}
                  type="checkbox"
                  name={title}
                  component={CheckboxWithLabel}
                />
              ))}
              <DialogActions>
                <Button>OK</Button>
              </DialogActions>
              <pre>{JSON.stringify(values, null, 2)}</pre>
            </>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectToLocation;
