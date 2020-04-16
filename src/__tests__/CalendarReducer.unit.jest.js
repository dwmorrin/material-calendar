import calendarReducer from "../calendar/Reducer";
import { CalendarAction } from "../calendar/types";

const now = new Date();
const later = new Date();
later.setDate(later.getDate() + 1);
const initialState = {
  currentEvent: { id: 1 },
  currentStart: now,
  currentView: "resourceTimeGridDay",
  detailIsOpen: false,
  drawerIsOpen: false,
  events: [],
  loading: false,
  locations: [],
  pickerShowing: false,
  ref: null,
};

const modifiedState = {
  currentEvent: { id: 2 },
  currentStart: later,
  currentView: "resourceTimeGridWeek",
  detailIsOpen: true,
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
