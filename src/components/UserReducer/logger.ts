import { CalendarAction } from "../types";
import { StateHandler } from "./types";

const logger: (r: StateHandler) => StateHandler = (reducer) => {
  if (process.env.NODE_ENV === "production") return reducer;

  const loggingReducer: StateHandler = (state, action) => {
    // eslint-disable-next-line no-console
    console.log({
      state,
      action: { ...action, type: CalendarAction[action.type] },
    });
    return reducer(state, action);
  };
  return loggingReducer;
};

export default logger;
