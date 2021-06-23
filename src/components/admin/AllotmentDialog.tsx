import React, { FC, useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Box,
  FormLabel,
  makeStyles,
} from "@material-ui/core";
import { TextField } from "formik-material-ui";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { DatePicker } from "formik-material-ui-pickers";
import DateFnUtils from "@date-io/date-fns";
import DraggablePaper from "../DraggablePaper";
import { Formik, Form, Field, FormikValues } from "formik";
import { AdminUIProps, AdminAction, FormValues } from "../../admin/types";
import {
  formatSQLDate,
  isValidDateInterval,
  parseSQLDate,
  subDays,
  isWithinIntervalFP,
} from "../../utils/date";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";

const useStyles = makeStyles({
  error: {
    color: "red",
  },
});

const initialErrors = { start: "", end: "" };

const AllotmentDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const [formErrors, setFormErrors] = useState(initialErrors);
  const classes = useStyles();
  if (!state.calendarSelectionState || !state.schedulerLocationId) return null;
  const { start, end, location, resource } = state.calendarSelectionState;

  const project = state.resources[ResourceKey.Projects].find(
    ({ id }) => resource.extendedProps.projectId === id
  ) as Project;
  if (!project) return null;

  const close = (): void => {
    setFormErrors(initialErrors);
    dispatch({ type: AdminAction.CloseAllotmentDialog });
  };

  const validate = (values: FormValues): void => {
    const isWithinProject = isWithinIntervalFP({
      start: parseSQLDate(project.start),
      end: parseSQLDate(project.end),
    });
    const start = values.start as Date;
    const end = values.end as Date;
    setFormErrors({
      start: !isWithinProject(start)
        ? "Start is outside of project"
        : isValidDateInterval({ start, end })
        ? ""
        : "Start is before end",
      end: isWithinProject(end) ? "" : "End is outside of project",
    });
  };

  const onSubmit = (values: FormValues, actions: FormikValues): void => {
    const dispatchError = (error: Error): void =>
      dispatch({ type: AdminAction.Error, payload: { error } });
    fetch(`${Project.url}/${project.id}/allotments`, {
      method: "PUT",
      body: JSON.stringify({
        projectId: project.id,
        locationId: location.id,
        start: formatSQLDate(values.start as Date),
        end: formatSQLDate(values.end as Date),
        hours: Number(values.hours as string),
      }),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then(({ error }) => {
        if (error) return dispatchError(error);
        fetch(Project.url)
          .then((response) => response.json())
          .then(({ error, data }) =>
            dispatch(
              error
                ? { type: AdminAction.Error, payload: { error } }
                : {
                    type: AdminAction.ReceivedResource,
                    payload: {
                      resources: {
                        ...state.resources,
                        [ResourceKey.Projects]: data as Project[],
                      },
                    },
                    meta: ResourceKey.Projects,
                  }
            )
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
    start: parseSQLDate(start),
    end: subDays(parseSQLDate(end), 1),
    hours: 0,
  };

  return (
    <Dialog
      open={state.allotmentDialogIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-tite"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        Create allotment for {project.title} in {location.title}
      </DialogTitle>
      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validate={validate}
          >
            {({ handleSubmit }): unknown => (
              <Form onSubmit={handleSubmit}>
                <Box style={{ display: "flex", flexDirection: "column" }}>
                  {!!formErrors.start && (
                    <FormLabel className={classes.error}>
                      {formErrors.start}
                    </FormLabel>
                  )}
                  <Field component={DatePicker} name="start" label="Start" />
                  {!!formErrors.end && (
                    <FormLabel className={classes.error}>
                      {formErrors.end}
                    </FormLabel>
                  )}
                  <Field component={DatePicker} name="end" label="End" />
                  <Field component={TextField} name="hours" label="Hours" />
                </Box>
                <DialogActions>
                  <Button onClick={close}>Cancel</Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={!!formErrors.start || !!formErrors.end}
                  >
                    Submit
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </MuiPickersUtilsProvider>
      </DialogContent>
    </Dialog>
  );
};

export default AllotmentDialog;
