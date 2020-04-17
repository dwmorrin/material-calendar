import calendarReducer from "../calendar/Reducer";
import { CalendarAction } from "../calendar/types";

const initialState = {};
const modifiedState = {
  currentEvent: true,
  currentStart: true,
  currentView: true,
  detailIsOpen: true,
  drawerIsOpen: true,
  events: [],
  loading: true,
  locations: [],
  pickerShowing: true,
  ref: true,
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
