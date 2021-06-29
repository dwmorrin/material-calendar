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
  addDays,
  areIntervalsOverlappingInclusive,
  formatSQLDate,
  isAfter,
  isBefore,
  isWithinIntervalFP,
  parseSQLDate,
  subDays,
} from "../../utils/date";
import { ResourceKey } from "../../resources/types";
import VirtualWeek from "../../resources/VirtualWeek";
import fetchProjectsAndVirtualWeeks from "../../admin/fetchProjectsAndVirtualWeeks";
import ErrorFormLabel from "../ErrorFormLabel";

enum VirtualWeekModifier {
  resize = "resize",
  split = "split",
  join = "join",
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

  const { startStr, extendedProps } = calendarEventClickState;
  const selectedId = extendedProps.id as number;
  if (typeof selectedId !== "number" || selectedId < 1) return null;

  const virtualWeeks = (
    state.resources[ResourceKey.VirtualWeeks] as VirtualWeek[]
  ).filter(({ locationId }) => locationId === schedulerLocationId);
  const week = virtualWeeks.find(({ id }) => id === selectedId);
  if (!week) return null;

  const isSingleDay = week.start === week.end;
  // RULE: only allow joins to adjacent week.
  // RULE: selected week is before the week to be joined.
  const joinableWeek = virtualWeeks.find(
    ({ start }) => formatSQLDate(addDays(parseSQLDate(week.end), 1)) === start
  );

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
            if (error) dispatchError(error);
            fetchProjectsAndVirtualWeeks({
              dispatch,
              state,
              type: AdminAction.ReceivedResourcesAfterVirtualWeekUpdate,
            });
          })
          .catch(dispatchError);
        break;
      case VirtualWeekModifier.split: {
        // body: [resizedWeek, newWeek]
        const resizedWeek = {
          ...week,
          end: formatSQLDate(subDays(values.split as Date, 1)),
        };
        const newWeek = {
          locationId: week.locationId,
          semesterId: week.semesterId,
          start: formatSQLDate(values.split as Date),
          end: week.end,
        };
        fetch(`${url}/split`, {
          method: "PUT",
          body: JSON.stringify([resizedWeek, newWeek]),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .then(({ error }) => {
            if (error) dispatchError(error);
            fetchProjectsAndVirtualWeeks({
              dispatch,
              state,
              type: AdminAction.ReceivedResourcesAfterVirtualWeekUpdate,
            });
          })
          .catch(dispatchError);
        break;
      }
      case VirtualWeekModifier.join: {
        // resize left, delete right
        fetch(`${url}/join`, {
          method: "PUT",
          body: JSON.stringify([
            { ...week, end: joinableWeek?.end },
            joinableWeek,
          ]),
          headers: { "Content-Type": "application/json" },
        })
          .then((res) => res.json())
          .then(({ error }) => {
            if (error) dispatchError(error);
            fetchProjectsAndVirtualWeeks({
              dispatch,
              state,
              type: AdminAction.ReceivedResourcesAfterVirtualWeekUpdate,
            });
          })
          .catch(dispatchError);
        break;
      }
      case VirtualWeekModifier.delete:
        fetch(url, { method: "DELETE" })
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
    }
  };

  const initialValues = {
    start: parseSQLDate(week.start),
    end: parseSQLDate(week.end),
    split: parseSQLDate(startStr),
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
    // split must be 1 day after start and on or before end
    const splitAfterStart = isAfter(
      values.split as Date,
      parseSQLDate(week.start)
    )
      ? ""
      : "Split must be after current start";
    const splitBeforeEnd = isBefore(
      values.split as Date,
      addDays(parseSQLDate(week.end), 1)
    )
      ? ""
      : "Split must be on or before current end";

    setErrors({
      start:
        startNotWithin ||
        (overlapError ? "overlaps with another virtual week" : ""),
      end:
        endNotWithin ||
        (overlapError ? "overlaps with another virtual week" : ""),
      split: splitAfterStart || splitBeforeEnd || "",
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
                    label={
                      "Split" +
                      (isSingleDay ? " (cannot split single day)" : "")
                    }
                    value={VirtualWeekModifier.split}
                    control={<Radio />}
                    disabled={isSingleDay}
                  />
                  <FormControlLabel
                    label={
                      "Join" +
                      (joinableWeek
                        ? ""
                        : " (join requires an adjacent week after the selected week)")
                    }
                    value={VirtualWeekModifier.join}
                    control={<Radio />}
                    disabled={!joinableWeek}
                  />
                  <FormControlLabel
                    label="Delete"
                    value={VirtualWeekModifier.delete}
                    control={<Radio />}
                  />
                </Field>
                <Box style={{ display: "flex", flexDirection: "column" }}>
                  {values.mode === VirtualWeekModifier.split && (
                    <>
                      {!!errors.split && (
                        <ErrorFormLabel>{errors.split}</ErrorFormLabel>
                      )}
                      <Field
                        component={DatePicker}
                        name="split"
                        label="Select 2nd start date"
                      />
                    </>
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
                {values.mode === VirtualWeekModifier.join && (
                  <p>
                    Warning: the project allotments on the right will be deleted
                    and the allotted hours will be ignored. This action does not
                    automatically add the allotment hours.
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
              </Form>
            )}
          </Formik>
        </MuiPickersUtilsProvider>
      </DialogContent>
    </Dialog>
  );
};

export default VirtualWeekSplitDialog;
