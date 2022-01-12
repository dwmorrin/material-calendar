import { CalendarState, Action } from "../types";

export type StateHandler = (
  state: CalendarState,
  action: Action
) => CalendarState;
