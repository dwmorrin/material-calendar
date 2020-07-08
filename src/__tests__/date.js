import {
  compareDateOrder,
  dateInputToNumber,
  getFormattedDate,
  getFormattedEventInterval,
  isDate,
  yyyymmdd,
  unshiftTZ,
  formatYYYYMMDD,
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

test("formatYYYYMMDD", () => {
  const expected = "2020-09-03 09:00:00";
  expect(formatYYYYMMDD(expected)).toBe(expected);
  expect(formatYYYYMMDD(localDateString)).toBe(expected);
});
