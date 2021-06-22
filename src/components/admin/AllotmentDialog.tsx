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
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { DatePicker } from "formik-material-ui-pickers";
import DateFnUtils from "@date-io/date-fns";
import DraggablePaper from "../DraggablePaper";
import { Formik, Form, Field, FormikValues } from "formik";
import { AdminUIProps, AdminAction, FormValues } from "../../admin/types";
import { isValidDateInterval, parseSQLDate } from "../../utils/date";
import { subDays } from "date-fns";
import { ResourceKey } from "../../resources/types";
import { isWithinInterval } from "date-fns/fp";
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
    const isWithinProject = isWithinInterval({
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

  const onSubmit = (_: FormValues, actions: FormikValues): void => {
    setFormErrors(initialErrors);
    actions.setSubmitting(false);
  };

  const initialValues = {
    start: parseSQLDate(start),
    end: subDays(parseSQLDate(end), 1),
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
