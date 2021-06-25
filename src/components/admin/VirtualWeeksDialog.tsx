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
import DraggablePaper from "../../components/DraggablePaper";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnUtils from "@date-io/date-fns";
import { Field, Formik, Form } from "formik";
import { DatePicker } from "formik-material-ui-pickers";
import { AdminUIProps, AdminAction } from "../../admin/types";
import { makeOnSubmit } from "../../admin/virtualWeeksDialog";
import { parseSQLDate, subDays } from "../../utils/date";

const VirtualWeeksDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const { calendarSelectionState, selectedSemester, schedulerLocationId } =
    state;
  if (
    !calendarSelectionState ||
    !selectedSemester ||
    schedulerLocationId === undefined
  )
    return null;

  const { location: currentLocation, start, end } = calendarSelectionState;

  const close = (): void =>
    dispatch({ type: AdminAction.CloseVirtualWeeksDialog });

  const onSubmit = makeOnSubmit(
    dispatch,
    state,
    selectedSemester,
    schedulerLocationId
  );

  const initialValues = {
    start: parseSQLDate(start),
    end: subDays(parseSQLDate(end), 1), // select has exclusive end
  };

  return (
    <Dialog
      open={state.virtualWeeksDialogIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        Create Virtual Week
      </DialogTitle>
      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <Formik initialValues={initialValues} onSubmit={onSubmit}>
            {({ handleSubmit, values }): unknown => (
              <Form onSubmit={handleSubmit}>
                <Box style={{ display: "flex", flexDirection: "column" }}>
                  <Field component={DatePicker} name="start" label="Start" />
                  <Field component={DatePicker} name="end" label="End" />
                </Box>
                <DialogActions>
                  <Button onClick={close}>Cancel</Button>
                  <Button variant="contained" type="submit">
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

export default VirtualWeeksDialog;
