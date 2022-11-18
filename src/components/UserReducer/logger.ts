import { CalendarAction } from "../types";
import { StateHandler } from "./types";

const logger: (r: StateHandler) => StateHandler = (reducer) => {
  if (process.env.NODE_ENV === "production") return reducer;

  const loggingReducer: StateHandler = (state, action) => {
    const label = CalendarAction[action.type];
    // eslint-disable-next-line no-console
    console.group(label);
    // eslint-disable-next-line no-console
    console.log({
      state,
      action: { ...action, type: label },
    });
    const result = reducer(state, action);
    // eslint-disable-next-line no-console
    console.log({ finalState: result });
    // eslint-disable-next-line no-console
    console.groupEnd();
    return result;
  };
  return loggingReducer;
};

export default logger;
