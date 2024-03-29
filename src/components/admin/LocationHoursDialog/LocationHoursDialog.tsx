import React, { FC } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormLabel,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnUtils from "@date-io/date-fns";
import {
  eachDayOfInterval,
  format,
  formatSQLDate,
  parseSQLDate,
} from "../../../utils/date";
import DraggablePaper from "../../DraggablePaper";
import { Field, Formik, Form, FieldArray } from "formik";
import { TextField, Checkbox } from "formik-material-ui";
import { AdminUIProps, AdminAction } from "../types";
import { makeOnSubmit, LocationHoursValues } from "./lib";

// how the date appears in the input: 2021-06-01 [Tue]
const dateLabelFormat = "yyyy-MM-dd [ccc]";

const LocationHoursDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const { calendarSelectionState } = state;

  const semester = state.selectedSemester;
  if (!calendarSelectionState || !semester) return null;

  const { location } = calendarSelectionState;

  const close = (): void =>
    dispatch({ type: AdminAction.CloseLocationHoursDialog });

  const onSubmit = makeOnSubmit(dispatch, state, location.id);

  const days: LocationHoursValues[] = eachDayOfInterval({
    start: parseSQLDate(semester.start),
    end: parseSQLDate(semester.end),
  }).map((date) => {
    const dateStr = formatSQLDate(date);
    const existingOverride = location.hours.find((h) => h.date === dateStr);
    return {
      date,
      hours: existingOverride ? String(existingOverride.hours) : "",
      useDefault: !existingOverride,
    };
  });

  return (
    <Dialog
      open={state.locationHoursDialogIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        Daily Hours for {location.title}
        <Typography variant="subtitle1">
          Use the checkbox to use the default hours for that day
        </Typography>
      </DialogTitle>
      <DialogContent>
        <List>
          <MuiPickersUtilsProvider utils={DateFnUtils}>
            <Formik initialValues={{ days }} onSubmit={onSubmit}>
              {({ handleSubmit, values }): unknown => (
                <Form onSubmit={handleSubmit}>
                  <FieldArray
                    name="days"
                    render={(): JSX.Element => (
                      <>
                        {values?.days?.length
                          ? values.days.map((_, i) => (
                              <ListItem key={`hoursInput${i}`}>
                                <FormLabel>
                                  {format(days[i].date, dateLabelFormat)}
                                </FormLabel>
                                <Field
                                  component={Checkbox}
                                  type="checkbox"
                                  name={`days[${i}].useDefault`}
                                />
                                {!values.days[i].useDefault && (
                                  <Field
                                    component={TextField}
                                    name={`days[${i}].hours`}
                                  />
                                )}
                              </ListItem>
                            ))
                          : null}
                      </>
                    )}
                  />
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
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default LocationHoursDialog;
