import React, { FunctionComponent } from "react";
import { Box, Dialog } from "@material-ui/core";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { CalendarAction, CalendarUIProps } from "./types";
import DateFnUtils from "@date-io/date-fns";

const StaticDatePicker: FunctionComponent<CalendarUIProps> = ({
  dispatch,
  state,
}) => {
  return (
    <Dialog
      open={state.pickerShowing}
      onClose={(): void => {
        dispatch({ type: CalendarAction.TogglePicker });
      }}
    >
      <Box>
        <MuiPickersUtilsProvider utils={DateFnUtils}>
          <DatePicker
            value={state.currentStart}
            onChange={(date: MaterialUiPickersDate): void => {
              dispatch({
                type: CalendarAction.PickedDate,
                payload: { currentStart: date || new Date() },
              });
            }}
            variant="static"
          />
        </MuiPickersUtilsProvider>
      </Box>
    </Dialog>
  );
};

export default StaticDatePicker;
