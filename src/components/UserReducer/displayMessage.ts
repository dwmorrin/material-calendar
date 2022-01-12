import { StateHandler } from "./types";
import { enqueue } from "../../utils/queue";

const displayMessage: StateHandler = (state, { payload }) => {
  if (!payload || !payload.message) {
    return state;
  }
  return {
    ...state,
    snackbarQueue: enqueue(state.snackbarQueue, {
      type: "success",
      message: payload.message || "",
      autoHideDuration: null,
    }),
  };
};
export default displayMessage;
