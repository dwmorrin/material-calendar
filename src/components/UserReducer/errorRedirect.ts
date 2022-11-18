import { CalendarState, CalendarAction, Action } from "../types";
import { ErrorType } from "../../utils/error";
import errorHandler from "./errorHandler";

/**
 * StateHandler functions can call this to switch control
 * to the error handler.
 */
const errorRedirect = (
  state: CalendarState,
  action: Action,
  message: string,
  meta?: unknown
): CalendarState =>
  errorHandler(
    { ...state, loading: false },
    {
      ...action,
      meta: meta || action.meta,
      type: CalendarAction.Error,
      payload: {
        ...action.payload,
        error: new Error(message),
      },
    }
  );

export const impossibleState = (
  state: CalendarState,
  action: Action,
  message: string
): CalendarState =>
  errorRedirect(state, action, message, ErrorType.IMPOSSIBLE_STATE);

export const missingResource = (
  state: CalendarState,
  action: Action,
  message: string
): CalendarState =>
  errorRedirect(state, action, message, ErrorType.MISSING_RESOURCE);
