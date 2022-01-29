import React, { FunctionComponent } from "react";
import { Box, Dialog } from "@material-ui/core";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { CalendarAction, CalendarUIProps } from "./types";
import DateFnUtils from "@date-io/date-fns";
import getFCDateFromState from "./Calendar/getFCDateFromState";
import { formatSQLDate } from "../utils/date";

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
            value={getFCDateFromState(state)}
            onChange={(date: MaterialUiPickersDate): void => {
              dispatch({
                type: CalendarAction.PickedDate,
                payload: { currentStart: formatSQLDate(date || new Date()) },
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
