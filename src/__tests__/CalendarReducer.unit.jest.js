import calendarReducer from "../calendar/Reducer";
import { CalendarAction } from "../calendar/types";
import { testModifiedState } from "../calendar/initialCalendarState";

const initialCalendarState = { locations: [] };

Object.keys(CalendarAction).forEach((action) => {
  if (!isNaN(+action)) return;
  if (action === "Error") return;
  test(`has case for action: ${action}`, () => {
    expect(
      calendarReducer(initialCalendarState, {
        type: CalendarAction[action],
        payload: testModifiedState,
      })
    ).not.toStrictEqual(initialCalendarState);
  });
});
