import React, { FC } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormLabel,
} from "@material-ui/core";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnUtils from "@date-io/date-fns";
import { eachDayOfInterval, format, parseJSON } from "date-fns";
import DraggablePaper from "../../components/DraggablePaper";
import { Field, Formik, Form, FieldArray } from "formik";
import { TextField } from "formik-material-ui";
import { AdminUIProps, AdminAction } from "../../admin/types";
import { makeOnSubmit } from "../../admin/locationHoursDialog";

const LocationHoursDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const { locationHoursState, selectedSemester, schedulerLocationId } = state;
  if (
    !locationHoursState ||
    !selectedSemester ||
    schedulerLocationId === undefined
  )
    return null;

  const { location: currentLocation } = locationHoursState;

  const close = (): void =>
    dispatch({ type: AdminAction.CloseLocationHoursDialog });

  const onSubmit = makeOnSubmit(
    dispatch,
    state,
    selectedSemester,
    schedulerLocationId
  );

  const days = eachDayOfInterval({
    start: parseJSON(selectedSemester.start),
    end: parseJSON(selectedSemester.end),
  }).map((date) => ({ date, hours: 0 }));

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
                        ? (values as {
                            days: { date: Date; hours: number }[];
                          }).days.map((_, i) => (
                            <div
                              key={`hoursInput${i}`}
                              style={{
                                gridTemplateColumns: "200px 30px",
                                display: "grid",
                              }}
                            >
                              <FormLabel>
                                {format(days[i].date, "yyyy-MM-dd [ccc]")}
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
