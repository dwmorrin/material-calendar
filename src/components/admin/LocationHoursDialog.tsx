import React, { FC } from "react";
import {
  Button,
  Dialog,
  Paper,
  PaperProps,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormLabel,
  Box,
} from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import MomentUtils from "@date-io/moment";
import Draggable from "react-draggable";
import { Field, Formik, Form } from "formik";
import { CheckboxWithLabel } from "formik-material-ui";
import { DatePicker, TimePicker } from "formik-material-ui-pickers";
import { AdminUIProps, AdminAction } from "../../admin/types";
import Location from "../../resources/Location";
import { makeDateTimeInputString } from "../../utils/date";

const DraggablePaper: FC = (props: PaperProps) => (
  <Draggable
    handle="#draggable-dialog-title"
    cancel={'[class*="MuiDialogContent-root"]'}
  >
    <Paper {...props} />
  </Draggable>
);

export interface LocationHoursState {
  select: { start: Date; end: Date };
  time: { start: string; end: string };
  location: Location;
}

const LocationHoursDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const { locationHoursState } = state;
  if (!locationHoursState) return null;
  const { location: currentLocation, select, time } = locationHoursState;
  const parseTime = (
    timeString: string
  ): { hours: number; minutes: number; seconds: number } =>
    timeString.split(":").reduce(
      (time, str, index) => ({
        ...time,
        [index === 0 ? "hours" : index === 1 ? "minutes" : "seconds"]: +str,
      }),
      {} as { hours: number; minutes: number; seconds: number }
    );
  const close = (): void =>
    dispatch({ type: AdminAction.CloseLocationHoursDialog });
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
      end: makeDateTimeInputString({ date: select.end, unshift: false }),
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
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Formik initialValues={initialValues} onSubmit={close}>
            <Form>
              <Box>
                <Field component={TimePicker} name="start" label="Start" />
                <Field component={TimePicker} name="end" label="End" />
              </Box>
              <Box style={{ display: "flex", flexDirection: "column" }}>
                <FormLabel>Apply to date range</FormLabel>
                <Field component={DatePicker} name="from.start" label="Start" />
                <Field
                  component={DatePicker}
                  name="from.end"
                  label="End (Exclusive)"
                />
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
            </Form>
          </Formik>
        </MuiPickersUtilsProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationHoursDialog;
