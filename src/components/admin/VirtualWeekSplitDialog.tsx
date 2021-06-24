import React, { FC } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Box,
} from "@material-ui/core";
import DraggablePaper from "../../components/DraggablePaper";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnUtils from "@date-io/date-fns";
import { Field, Formik, Form } from "formik";
import { DatePicker } from "formik-material-ui-pickers";
import { AdminUIProps, AdminAction } from "../../admin/types";
import { parseSQLDate } from "../../utils/date";
import { ResourceKey } from "../../resources/types";
import VirtualWeek from "../../resources/VirtualWeek";

const VirtualWeekSplitDialog: FC<AdminUIProps> = ({ dispatch, state }) => {
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

  const week = (
    state.resources[ResourceKey.VirtualWeeks] as VirtualWeek[]
  ).find(({ id }) => id === selectedId);
  if (!week) return null;

  const close = (): void =>
    dispatch({ type: AdminAction.CloseVirtualWeekSplitDialog });

  const onSubmit = (): void => console.log("not implemented yet");

  const initialValues = {
    start: parseSQLDate(week.end),
  };

  return (
    <Dialog
      open={state.virtualWeekSplitDialogIsOpen}
      onClose={close}
      PaperComponent={DraggablePaper}
      aria-labelledby="draggable-dialog-title"
    >
      <DialogTitle style={{ cursor: "move" }} id="draggable-dialog-title">
        Split Virtual Week
      </DialogTitle>
      <DialogContent>
        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <Formik initialValues={initialValues} onSubmit={onSubmit}>
            {({ handleSubmit, values }): unknown => (
              <Form onSubmit={handleSubmit}>
                <Box style={{ display: "flex", flexDirection: "column" }}>
                  <Field
                    component={DatePicker}
                    name="start"
                    label="Select 2nd start date"
                  />
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

export default VirtualWeekSplitDialog;
