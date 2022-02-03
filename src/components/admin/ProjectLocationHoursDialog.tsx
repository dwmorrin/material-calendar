import React, { FC, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Paper,
  Table,
  TableCell,
  TableContainer,
  TableRow,
} from "@material-ui/core";
import { TextField } from "formik-material-ui";
import DraggablePaper from "../DraggablePaper";
import { Formik, Form, Field, FormikValues } from "formik";
import { AdminUIProps, AdminAction } from "./types";
import {
  parseSQLDate,
  subDays,
  isWithinIntervalFP,
  parseAndFormatSQLDateInterval,
  isIntervalWithinInterval,
} from "../../utils/date";
import { ResourceKey } from "../../resources/types";
import Location from "../../resources/Location";
import Project from "../../resources/Project";
import VirtualWeek from "../../resources/VirtualWeek";

const initialErrors = { hours: "" };

const DialogWrapper: FC<AdminUIProps & { onClose: () => void }> = ({
  state,
  children,
  onClose,
}) => (
  <Dialog
    open={state.projectLocationHoursDialogIsOpen}
    onClose={onClose}
    PaperComponent={DraggablePaper}
    aria-labelledby="draggable-dialog-title"
  >
    {children}
  </Dialog>
);

const ProjectLocationHoursDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const [formErrors, setFormErrors] = useState(initialErrors);
  if (!state.calendarSelectionState) return null;
  const { location, resource, title } = state.calendarSelectionState;
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
    dispatch({ type: AdminAction.CloseProjectLocationHoursDialog });
  };

  // allotments must be matched to a virtual week
  if (!virtualWeeks.length)
    return (
      <DialogWrapper dispatch={dispatch} state={state} onClose={close}>
        {" "}
        Please create virtual weeks first.
      </DialogWrapper>
    );

  const isWithinSelection = isIntervalWithinInterval({ start, end });

  // is the selection under an existing allotment?
  const existing = project.allotments.find(
    ({ start, end, locationId }) =>
      locationId === location.id &&
      isWithinSelection({ start: parseSQLDate(start), end: parseSQLDate(end) })
  );

  // find closest virtual week to the selection
  const selectedWeek = virtualWeeks.find(({ start, end, id }) =>
    existing
      ? existing.virtualWeekId === id
      : isWithinSelection({
          start: parseSQLDate(start),
          end: parseSQLDate(end),
        })
  );

  if (!selectedWeek)
    return (
      <DialogWrapper dispatch={dispatch} state={state} onClose={close}>
        <DialogTitle>Invalid allotment selection</DialogTitle>
        <DialogContent>
          Project start/end not aligned with a virtual week. Adjust project
          start/end or virtual week size.
        </DialogContent>
      </DialogWrapper>
    );

  const locationHours = Location.getTotalHours(location, selectedWeek);

  const validate = (values: Record<string, unknown>): void => {
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
  const onSubmit = (
    values: Record<string, unknown>,
    actions: FormikValues
  ): void => {
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
      .then(({ error, data }) => {
        if (error) return dispatchError(error);
        if (!data) return dispatchError(new Error("No data returned"));
        const { projects, weeks } = data as {
          projects: Project[];
          weeks: VirtualWeek[];
        };
        dispatch({
          type: AdminAction.ReceivedResourcesAfterProjectLocationHoursUpdate,
          payload: {
            resources: {
              ...state.resources,
              [ResourceKey.Projects]: projects.map((p) => new Project(p)),
              [ResourceKey.VirtualWeeks]: weeks.map((w) => new VirtualWeek(w)),
            },
          },
        });
      })
      .catch(dispatchError)
      .finally(() => {
        setFormErrors(initialErrors);
        actions.setSubmitting(false);
        dispatch({ type: AdminAction.CloseProjectLocationHoursDialog });
      });
  };

  const initialValues = {
    hours: existing?.hours || 0,
  };

  return (
    <DialogWrapper state={state} dispatch={dispatch} onClose={close}>
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        Allot project hours
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper}>
          <Table>
            <TableRow>
              <TableCell>Info</TableCell>
              <TableCell>{title || "?"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Location</TableCell>
              <TableCell>{location.title}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>{project.title}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Virtual week</TableCell>
              <TableCell>
                {parseAndFormatSQLDateInterval(selectedWeek)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Location hours</TableCell>
              <TableCell>{locationHours}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Project hours</TableCell>
              <TableCell>{selectedWeek.projectHours}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Hours remaining</TableCell>
              <TableCell>{locationHours - selectedWeek.projectHours}</TableCell>
            </TableRow>
          </Table>
        </TableContainer>
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
    </DialogWrapper>
  );
};

export default ProjectLocationHoursDialog;
