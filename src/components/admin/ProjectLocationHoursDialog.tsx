import React, { FC, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
} from "@material-ui/core";
import { TextField } from "formik-material-ui";
import DraggablePaper from "../DraggablePaper";
import { Formik, Form, Field, FormikValues } from "formik";
import { AdminUIProps, AdminAction, FormValues } from "../../admin/types";
import {
  parseSQLDate,
  subDays,
  isWithinIntervalFP,
  parseAndFormatSQLDateInterval,
  isIntervalWithinInterval,
} from "../../utils/date";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";
import VirtualWeek from "../../resources/VirtualWeek";

const initialErrors = { hours: "" };

const ProjectLocationHoursDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const [formErrors, setFormErrors] = useState(initialErrors);
  if (!state.calendarSelectionState || !state.schedulerLocationId) return null;
  const { location, resource } = state.calendarSelectionState;
  const start = parseSQLDate(state.calendarSelectionState.start);
  const end = subDays(parseSQLDate(state.calendarSelectionState.end), 1);

  const project = state.resources[ResourceKey.Projects].find(
    ({ id }) => resource.extendedProps.projectId === id
  ) as Project;
  if (!project) return null;
  const isWithinProject = isWithinIntervalFP({
    start: parseSQLDate(project.start),
    end: parseSQLDate(project.end),
  });

  // we only want virtual weeks in this location that are within the user's selection
  const virtualWeeks = (
    state.resources[ResourceKey.VirtualWeeks] as VirtualWeek[]
  ).filter(
    ({ start, end, locationId }) =>
      locationId === location.id &&
      isWithinProject(parseSQLDate(start)) &&
      isWithinProject(parseSQLDate(end))
  );

  const close = (): void => {
    setFormErrors(initialErrors);
    dispatch({ type: AdminAction.CloseAllotmentDialog });
  };

  // allotments must be matched to a virtual week
  if (!virtualWeeks.length)
    return (
      <Dialog
        open={state.allotmentDialogIsOpen}
        onClose={close}
        PaperComponent={DraggablePaper}
        aria-labelledby="draggable-dialog-title"
      >
        Please create virtual weeks first.
      </Dialog>
    );

  const isWithinSelection = isIntervalWithinInterval({ start, end });

  // is the selection under an existing allotment?
  const existing = project.allotments.find(({ start, end }) =>
    isWithinSelection({ start: parseSQLDate(start), end: parseSQLDate(end) })
  );

  // find closest virtual week to the selection
  const selectedWeek =
    virtualWeeks.find(({ start, end, id }) =>
      existing
        ? existing.virtualWeekId === id
        : isWithinSelection({
            start: parseSQLDate(start),
            end: parseSQLDate(end),
          })
    ) || virtualWeeks[0];

  const validate = (values: FormValues): void => {
    const hours = Number(values.hours);
    setFormErrors({
      hours: !isNaN(hours) && hours >= 0 ? "" : "Please enter a number",
    });
  };

  /**
   * Updates or creates project time allotments in a particular location.
   * On success, we need to update projects and virtual weeks so those are fetched
   * from the server. This should update the "hours remaining" section of the calendar.
   */
  const onSubmit = (values: FormValues, actions: FormikValues): void => {
    const dispatchError = (error: Error): void =>
      dispatch({ type: AdminAction.Error, payload: { error } });
    fetch(`${Project.url}/${project.id}/allotments`, {
      method: "PUT",
      body: JSON.stringify({
        projectId: project.id,
        virtualWeekId: selectedWeek.id,
        hours: Number(values.hours),
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then(({ error }) => {
        if (error) return dispatchError(error);
        Promise.all([
          fetch(`${Project.url}?context=${ResourceKey.Projects}`),
          fetch(`${VirtualWeek.url}?context=${ResourceKey.VirtualWeeks}`),
        ])
          .then((responses) =>
            Promise.all(responses.map((response) => response.json()))
              .then((dataArray) => {
                if (dataArray.some(({ error }) => !!error))
                  // returning the first error only; better if we could return all
                  return dispatchError(
                    dataArray.find(({ error }) => !!error).error
                  );
                const projects = dataArray.find(
                  ({ context }) => Number(context) === ResourceKey.Projects
                );
                if (!projects || !Array.isArray(projects.data))
                  return dispatchError(
                    new Error("no projects returned in allotment update")
                  );
                const virtualWeeks = dataArray.find(
                  ({ context }) => Number(context) === ResourceKey.VirtualWeeks
                );
                if (!virtualWeeks || !Array.isArray(virtualWeeks.data))
                  return dispatchError(
                    new Error("no virtual weeks returned in allotment update")
                  );
                dispatch({
                  type: AdminAction.ReceivedResourcesAfterAllotmentUpdate,
                  payload: {
                    resources: {
                      ...state.resources,
                      [ResourceKey.Projects]: projects.data,
                      [ResourceKey.VirtualWeeks]: virtualWeeks.data,
                    },
                  },
                });
              })
              .catch(dispatchError)
          )
          .catch(dispatchError);
      })
      .catch(dispatchError)
      .finally(() => {
        setFormErrors(initialErrors);
        actions.setSubmitting(false);
        dispatch({ type: AdminAction.CloseAllotmentDialog });
      });
  };

  const initialValues = {
    hours: existing?.hours || 0,
  };

  return (
    <Dialog
      open={state.allotmentDialogIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        Set hours for {project.title} in {location.title}
      </DialogTitle>
      <DialogContent>
        <p>{parseAndFormatSQLDateInterval(selectedWeek)}</p>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validate={validate}
        >
          {({ handleSubmit }): unknown => (
            <Form onSubmit={handleSubmit}>
              <Field component={TextField} name="hours" label="Hours" />
              <DialogActions>
                <Button onClick={close}>Cancel</Button>
                <Button
                  variant="contained"
                  type="submit"
                  disabled={!!formErrors.hours}
                >
                  Submit
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectLocationHoursDialog;
