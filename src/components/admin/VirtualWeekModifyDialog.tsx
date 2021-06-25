import React, { FC, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import { RadioGroup } from "formik-material-ui";
import DraggablePaper from "../../components/DraggablePaper";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnUtils from "@date-io/date-fns";
import { Field, Formik, Form } from "formik";
import { DatePicker } from "formik-material-ui-pickers";
import { AdminUIProps, AdminAction, FormValues } from "../../admin/types";
import {
  areIntervalsOverlappingInclusive,
  formatSQLDate,
  isWithinIntervalFP,
  parseSQLDate,
} from "../../utils/date";
import { ResourceKey } from "../../resources/types";
import VirtualWeek from "../../resources/VirtualWeek";
import fetchProjectsAndVirtualWeeks from "../../admin/fetchProjectsAndVirtualWeeks";
import ErrorFormLabel from "../ErrorFormLabel";
import Semester from "../../resources/Semester";

enum VirtualWeekModifier {
  resize = "resize",
  split = "split",
  delete = "delete",
}

const VirtualWeekSplitDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const [errors, setErrors] = useState({ start: "", end: "", split: "" });
  const { calendarEventClickState, selectedSemester, schedulerLocationId } =
    state;
  if (
    !calendarEventClickState ||
    !selectedSemester ||
    schedulerLocationId === undefined
  )
    return null;

  const { extendedProps } = calendarEventClickState;
  const selectedId = extendedProps.id as number;
  if (typeof selectedId !== "number" || selectedId < 1) return null;

  const virtualWeeks = (
    state.resources[ResourceKey.VirtualWeeks] as VirtualWeek[]
  ).filter(({ locationId }) => locationId === schedulerLocationId);
  const week = virtualWeeks.find(({ id }) => id === selectedId);
  if (!week) return null;

  const close = (): void =>
    dispatch({ type: AdminAction.CloseVirtualWeekModifyDialog });
  const dispatchError = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });

  const onSubmit = (values: FormValues): void => {
    const url = `${VirtualWeek.url}/${week.id}`;
    switch (values.mode as VirtualWeekModifier) {
      case VirtualWeekModifier.resize:
        fetch(url, {
          method: "PUT",
          body: JSON.stringify({
            ...week,
            start: formatSQLDate(values.start as Date),
            end: formatSQLDate(values.end as Date),
          }),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .then(({ error }) => {
            if (error) dispatch(error);
            fetchProjectsAndVirtualWeeks({
              dispatch,
              state,
              type: AdminAction.ReceivedResourcesAfterVirtualWeekUpdate,
            });
          })
          .catch(dispatchError);
        break;
      case VirtualWeekModifier.split:
        // TODO define split actions
        // TODO dispatch update
        fetch(`${url}/split`, { method: "PUT", body: JSON.stringify([week]) });
        break;
      case VirtualWeekModifier.delete:
        // TODO check if all project location hours are deleted
        // TODO dispatch update
        fetch(url, { method: "DELETE" });
        break;
    }
  };

  const initialValues = {
    start: parseSQLDate(week.start),
    end: parseSQLDate(week.end),
    split: parseSQLDate(week.end),
    mode: VirtualWeekModifier.resize,
  };

  const validate = (values: FormValues): void => {
    // disallow virtual week overlap
    const overlaps = areIntervalsOverlappingInclusive({
      start: values.start as Date,
      end: values.end as Date,
    });
    const overlapError = virtualWeeks.some(
      ({ id, start, end }) =>
        id !== week.id &&
        overlaps({ start: parseSQLDate(start), end: parseSQLDate(end) })
    );
    // disallow extending beyond semester
    const withinSemester = isWithinIntervalFP({
      start: parseSQLDate(selectedSemester.start),
      end: parseSQLDate(selectedSemester.end),
    });
    const startNotWithin = withinSemester(values.start as Date)
      ? ""
      : "Start outside semester";
    const endNotWithin = withinSemester(values.end as Date)
      ? ""
      : "End outside semester";
    setErrors({
      start:
        startNotWithin ||
        (overlapError ? "overlaps with another virtual week" : ""),
      end:
        endNotWithin ||
        (overlapError ? "overlaps with another virtual week" : ""),
      split: "",
    });
  };

  return (
    <Dialog
      open={state.virtualWeekModifyDialogIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        Modify Virtual Week
      </DialogTitle>
      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validate={validate}
          >
            {({ handleSubmit, values }): unknown => (
              <Form onSubmit={handleSubmit}>
                <Field component={RadioGroup} name="mode">
                  <FormControlLabel
                    label="Resize"
                    value={VirtualWeekModifier.resize}
                    control={<Radio />}
                  />
                  <FormControlLabel
                    label="Split"
                    value={VirtualWeekModifier.split}
                    control={<Radio />}
                  />
                  <FormControlLabel
                    label="Delete"
                    value={VirtualWeekModifier.delete}
                    control={<Radio />}
                  />
                </Field>
                <Box style={{ display: "flex", flexDirection: "column" }}>
                  {values.mode === VirtualWeekModifier.split && (
                    <Field
                      component={DatePicker}
                      name="split"
                      label="Select 2nd start date"
                    />
                  )}
                  {values.mode === VirtualWeekModifier.resize && (
                    <>
                      {!!errors.start && (
                        <ErrorFormLabel>{errors.start}</ErrorFormLabel>
                      )}
                      <Field
                        component={DatePicker}
                        name="start"
                        label="Start date"
                      />
                      {!!errors.end && (
                        <ErrorFormLabel>{errors.end}</ErrorFormLabel>
                      )}
                      <Field
                        component={DatePicker}
                        name="end"
                        label="End date"
                      />
                    </>
                  )}
                </Box>
                {values.mode === VirtualWeekModifier.delete && (
                  <p>
                    This will also delete all the project allotments within this
                    virtual week.
                  </p>
                )}
                <DialogActions>
                  <Button onClick={close}>Cancel</Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={
                      (values.mode === VirtualWeekModifier.resize &&
                        (!!errors.start || !!errors.end)) ||
                      (values.mode === VirtualWeekModifier.split &&
                        !!errors.split)
                    }
                  >
                    Submit
                  </Button>
                </DialogActions>
                <pre>{JSON.stringify(values, null, 2)}</pre>
              </Form>
            )}
          </Formik>
        </MuiPickersUtilsProvider>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualWeekSplitDialog;
