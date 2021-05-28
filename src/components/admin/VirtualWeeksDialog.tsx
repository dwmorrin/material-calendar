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
import { subtractOneDay } from "../../utils/date";
import { makeOnSubmit } from "../../admin/virtualWeeksDialog";

const VirtualWeeksDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
  const { locationHoursState, selectedSemester, schedulerLocationId } = state;
  if (
    !locationHoursState ||
    !selectedSemester ||
    schedulerLocationId === undefined
  )
    return null;

  const { location: currentLocation, select } = locationHoursState;

  const close = (): void =>
    dispatch({ type: AdminAction.CloseVirtualWeeksDialog });

  const onSubmit = makeOnSubmit(
    dispatch,
    state,
    selectedSemester,
    schedulerLocationId
  );

  const initialValues = {
    start: select.start,
    end: subtractOneDay(select.end), // select has exclusive end
  };

  return (
    <Dialog
      open={state.virtualWeeksDialogIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-tite"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        {currentLocation.title} Virtual Week
      </DialogTitle>
      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <Formik initialValues={initialValues} onSubmit={onSubmit}>
            {({ handleSubmit }): unknown => (
              <Form onSubmit={handleSubmit}>
                <Box style={{ display: "flex", flexDirection: "column" }}>
                  <FormLabel>Apply to date range</FormLabel>
                  <Field component={DatePicker} name="start" label="Start" />
                  <Field component={DatePicker} name="end" label="End" />
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

export default VirtualWeeksDialog;
