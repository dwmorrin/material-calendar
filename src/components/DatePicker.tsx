import React, { FunctionComponent } from "react";
import { Box, Dialog } from "@material-ui/core";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { CalendarAction, CalendarUIProps } from "./types";
import DateFnUtils from "@date-io/date-fns";
import { formatSQLDate, parseSQLDate } from "../utils/date";

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
            value={parseSQLDate(state.currentStart)}
            onChange={(date: MaterialUiPickersDate): void => {
              const currentStart = formatSQLDate(date || new Date());
              if (state.ref?.current)
                state.ref.current.getApi().gotoDate(currentStart);
              dispatch({
                type: CalendarAction.PickedDate,
                payload: { currentStart },
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
