import React, { FC } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormLabel,
  makeStyles,
} from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnUtils from "@date-io/date-fns";
import { eachDayOfInterval, format } from "date-fns";
import { formatSQLDate, parseSQLDate } from "../../utils/date";
import DraggablePaper from "../../components/DraggablePaper";
import { Field, Formik, Form, FieldArray } from "formik";
import { TextField } from "formik-material-ui";
import { AdminUIProps, AdminAction } from "../../admin/types";
import { makeOnSubmit } from "../../admin/locationHoursDialog";

const useStyles = makeStyles({
  locationHoursInput: {
    gridTemplateColumns: "200px 30px",
    display: "grid",
  },
});

// how the date appears in the input: 2021-06-01 [Tue]
const dateLabelFormat = "yyyy-MM-dd [ccc]";

const LocationHoursDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const { calendarSelectionState, selectedSemester, schedulerLocationId } =
    state;

  const classes = useStyles();

  if (
    !calendarSelectionState ||
    !selectedSemester ||
    schedulerLocationId === undefined
  )
    return null;

  const { location: currentLocation } = calendarSelectionState;

  const close = (): void =>
    dispatch({ type: AdminAction.CloseLocationHoursDialog });

  const onSubmit = makeOnSubmit(dispatch, state, schedulerLocationId);

  const days = eachDayOfInterval({
    start: parseSQLDate(selectedSemester.start),
    end: parseSQLDate(selectedSemester.end),
  }).map((date) => ({
    date,
    hours:
      currentLocation.hours.find((h) => h.date === formatSQLDate(date))
        ?.hours || 0,
  }));

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
          <Formik initialValues={{ days }} onSubmit={onSubmit}>
            {({ handleSubmit, values }): unknown => (
              <Form onSubmit={handleSubmit}>
                <FieldArray
                  name="days"
                  render={(): JSX.Element => (
                    <div>
                      {(values as { days: { date: Date; hours: number }[] })
                        ?.days?.length
                        ? (
                            values as {
                              days: { date: Date; hours: number }[];
                            }
                          ).days.map((_, i) => (
                            <div
                              className={classes.locationHoursInput}
                              key={`hoursInput${i}`}
                            >
                              <FormLabel>
                                {format(days[i].date, dateLabelFormat)}
                              </FormLabel>
                              <Field
                                component={TextField}
                                name={`days[${i}].hours`}
                              />
                            </div>
                          ))
                        : null}
                    </div>
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
      </DialogContent>
    </Dialog>
  );
};

export default LocationHoursDialog;
