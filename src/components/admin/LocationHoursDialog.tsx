import React, { FC } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormLabel,
  Box,
} from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnUtils from "@date-io/date-fns";
import DraggablePaper from "../../components/DraggablePaper";
import { Field, Formik, Form } from "formik";
import { CheckboxWithLabel } from "formik-material-ui";
import { DatePicker, TimePicker } from "formik-material-ui-pickers";
import { AdminUIProps, AdminAction } from "../../admin/types";
import {
  makeDateTimeInputString,
  parseTime,
  subtractOneDay,
} from "../../utils/date";
import { makeOnSubmit } from "../../admin/locationHoursDialog";

const LocationHoursDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const { locationHoursState, selectedSemester, schedulerLocationId } = state;
  if (
    !locationHoursState ||
    !selectedSemester ||
    schedulerLocationId === undefined
  )
    return null;

  const { location: currentLocation, select, time } = locationHoursState;

  const close = (): void =>
    dispatch({ type: AdminAction.CloseLocationHoursDialog });

  const onSubmit = makeOnSubmit(
    dispatch,
    state,
    selectedSemester,
    schedulerLocationId
  );

  const initialValues = {
    start: makeDateTimeInputString({
      hours: parseTime(time.start).hours,
      minutes: 0,
    }),
    end: makeDateTimeInputString({
      hours: parseTime(time.end).hours,
      minutes: 0,
    }),
    from: {
      start: makeDateTimeInputString({ date: select.start, unshift: false }),
      end: makeDateTimeInputString({
        date: subtractOneDay(select.end), // select has exclusive end
        unshift: false,
      }),
      allSemester: false,
    },
    repeat: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    },
  };

  return (
    <Dialog
      open={state.locationHoursDialogIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-tite"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        Daily Hours for {currentLocation.title}
      </DialogTitle>
      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <Formik initialValues={initialValues} onSubmit={onSubmit}>
            {({ handleSubmit }): unknown => (
              <Form onSubmit={handleSubmit}>
                <Box>
                  <Field component={TimePicker} name="start" label="Start" />
                  <Field component={TimePicker} name="end" label="End" />
                </Box>
                <Box style={{ display: "flex", flexDirection: "column" }}>
                  <FormLabel>Apply to date range</FormLabel>
                  <Field
                    component={DatePicker}
                    name="from.start"
                    label="Start"
                  />
                  <Field component={DatePicker} name="from.end" label="End" />
                  <Field
                    type="checkbox"
                    component={CheckboxWithLabel}
                    name="from.allSemester"
                    Label={{
                      label: "Apply to entire semester",
                    }}
                    checked={initialValues.from.allSemester}
                  />
                </Box>
                <Box>
                  <FormLabel>Repeat on</FormLabel>
                  <Field
                    type="checkbox"
                    component={CheckboxWithLabel}
                    name="repeat.monday"
                    Label={{ label: "M" }}
                    checked={initialValues.repeat.monday}
                  />
                  <Field
                    type="checkbox"
                    component={CheckboxWithLabel}
                    name="repeat.tuesday"
                    Label={{ label: "T" }}
                    checked={initialValues.repeat.tuesday}
                  />
                  <Field
                    type="checkbox"
                    component={CheckboxWithLabel}
                    name="repeat.wednesday"
                    Label={{ label: "W" }}
                    checked={initialValues.repeat.wednesday}
                  />
                  <Field
                    type="checkbox"
                    component={CheckboxWithLabel}
                    name="repeat.thursday"
                    Label={{ label: "Th" }}
                    checked={initialValues.repeat.thursday}
                  />
                  <Field
                    type="checkbox"
                    component={CheckboxWithLabel}
                    name="repeat.friday"
                    Label={{ label: "F" }}
                    checked={initialValues.repeat.friday}
                  />
                  <Field
                    type="checkbox"
                    component={CheckboxWithLabel}
                    name="repeat.saturday"
                    Label={{ label: "Sa" }}
                    checked={initialValues.repeat.saturday}
                  />
                  <Field
                    type="checkbox"
                    component={CheckboxWithLabel}
                    name="repeat.sunday"
                    Label={{ label: "Su" }}
                    checked={initialValues.repeat.sunday}
                  />
                </Box>
                <DialogActions>
                  <Button onClick={close}>Cancel</Button>
                  <Button variant="contained" type="submit">
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

export default LocationHoursDialog;
