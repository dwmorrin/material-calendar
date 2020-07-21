import {
  compareDateOrder,
  compareTimeInputOrder,
  dateInputToNumber,
  getFormattedDate,
  getFormattedEventInterval,
  hoursDifference,
  isDate,
  yyyymmdd,
  unshiftTZ,
  formatForMySQL,
  makeDefaultDateInputString,
} from "../utils/date";

test("isDate identifies Date objects", () => {
  expect(isDate()).toBe(false);
  expect(isDate([])).toBe(false);
  expect(isDate(new Date().toISOString())).toBe(false);
  expect(isDate(new Date().valueOf())).toBe(false);
  expect(isDate(new Date())).toBe(true);
});

test("dateInputToNumber returns a number", () => {
  const dateString = "2020-06-24";
  expect(dateInputToNumber(dateString)).toBe(new Date(dateString).valueOf());
  expect(() => dateInputToNumber()).toThrow();
});

test("compareDateOrder", () => {
  const a = "2020-06-24";
  const b = "2020-06-25";
  expect(compareDateOrder(a, a)).toBe(true);
  expect(compareDateOrder(a, b)).toBe(true);
  expect(compareDateOrder(b, a)).toBe(false);
});

test("getFormattedDate", () => {
  expect(getFormattedDate("2020-06-24")).toBe("06/24/2020");
});

test("getFormattedEventInterval same day, no time info", () => {
  expect(getFormattedEventInterval("2020-06-24", "2020-06-24")).toBe(
    "Wednesday, June 24"
  );
});

test("getFormattedEventInterval different days, no time info", () => {
  expect(getFormattedEventInterval("2020-06-24", "2020-06-25")).toBe(
    "Wednesday, June 24 - Thursday, June 25"
  );
});

test("getFormattedEventInterval same day, with time", () => {
  expect(
    getFormattedEventInterval(
      "2020-06-24T13:00:00.000Z",
      "2020-06-24T14:00:00.000Z"
    )
  ).toBe("Wednesday, June 24 \u00B7 1:00 PM - 2:00 PM");
});

test("getFormattedEventInterval different days, with time", () => {
  expect(
    getFormattedEventInterval(
      "2020-06-24T20:00:00.000Z",
      "2020-06-25T01:00:00.000Z"
    )
  ).toBe(
    "Wednesday, June 24 \u00B7 8:00 PM - Thursday, June 25 \u00B7 1:00 AM"
  );
});

test("yyyymmdd", () => {
  expect(yyyymmdd.test("2020-09-03")).toBe(true);
  expect(yyyymmdd.test("2020-9-3")).toBe(false);
  expect(yyyymmdd.test("2020-49-03")).toBe(false);
  expect(yyyymmdd.test("2020-09-33")).toBe(false);
  expect(yyyymmdd.test("2020-00-00")).toBe(false);
});

const localDateString = "9/3/2020 9:00:00 AM";
test("unshiftTZ", () => {
  expect(unshiftTZ(new Date(localDateString)).toJSON()).toBe(
    "2020-09-03T09:00:00.000Z"
  );
});

test("format for MySQL", () => {
  const expected = "2020-09-03 09:00:00";
  expect(formatForMySQL(expected)).toBe(expected);
  expect(formatForMySQL(localDateString)).toBe(expected);
});

// this fails if method uses .toISO/JSON and timezone shifting isn't accounted for
test("default date input string", () => {
  const nycAt11PM = new Date("2020-09-03T23:00:00.000-04:00");
  const [year, month, date] = makeDefaultDateInputString(nycAt11PM).split("-");
  expect(+year).toBe(nycAt11PM.getFullYear());
  expect(+month).toBe(nycAt11PM.getMonth() + 1);
  expect(+date).toBe(nycAt11PM.getDate());
});

const nineThirty = Object.freeze({ hours: 9, minutes: 30, seconds: 0 });
const tenOClock = Object.freeze({ hours: 10, minutes: 0, seconds: 0 });
const tenThirty = Object.freeze({ hours: 10, minutes: 30, seconds: 0 });
const nineOClock = Object.freeze({ hours: 9, minutes: 0, seconds: 0 });
const nineTwentyNine = Object.freeze({ hours: 9, minutes: 29, seconds: 0 });

test("time input order", () => {
  expect(compareTimeInputOrder(nineThirty, nineThirty)).toBe(false);
  expect(compareTimeInputOrder(nineThirty, tenOClock)).toBe(true);
  expect(compareTimeInputOrder(nineThirty, nineOClock)).toBe(false);
  expect(compareTimeInputOrder(nineThirty, nineTwentyNine)).toBe(false);
});

test("hours difference", () => {
  expect(hoursDifference(nineThirty, nineThirty)).toBe(24);
  expect(hoursDifference(nineThirty, nineOClock)).toBe(23);
  expect(hoursDifference(nineThirty, nineTwentyNine)).toBe(23);
  expect(hoursDifference(nineThirty, tenThirty)).toBe(1);
});
