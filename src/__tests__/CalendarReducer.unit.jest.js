import calendarReducer from "../calendar/Reducer";
import { CalendarAction } from "../calendar/types";

const now = new Date();
const later = new Date();
later.setDate(later.getDate() + 1);
const initialState = {
  currentStart: now,
  currentView: "resourceTimeGridDay",
  drawerIsOpen: false,
  events: [],
  loading: false,
  locations: [],
  pickerShowing: false,
  ref: null,
};

const modifiedState = {
  currentStart: later,
  currentView: "resourceTimeGridWeek",
  drawerIsOpen: true,
  events: ["event"],
  loading: true,
  locations: ["location"],
  pickerShowing: true,
  ref: {},
};

Object.keys(CalendarAction).forEach((action) => {
  if (!isNaN(+action)) return;
  if (action === "Error") return;
  test(`has case for action: ${action}`, () => {
    expect(
      calendarReducer(initialState, {
        type: CalendarAction[action],
        payload: modifiedState,
      })
    ).not.toStrictEqual(initialState);
  });
});
