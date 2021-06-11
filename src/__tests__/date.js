import {
  compareDateOrder,
  dateInputToNumber,
  getFormattedDate,
  getFormattedEventInterval,
  isDate,
  yyyymmdd,
  unshiftTZ,
  formatForMySQL,
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
    "Wed, Jun 24"
  );
});

test("getFormattedEventInterval different days, no time info", () => {
  expect(getFormattedEventInterval("2020-06-24", "2020-06-25")).toBe(
    "Wed, Jun 24 - Thu, Jun 25"
  );
});

test("getFormattedEventInterval same day, with time", () => {
  expect(
    getFormattedEventInterval("2020-06-24 13:00:00", "2020-06-24 14:00:00")
  ).toBe("Wed, Jun 24 \u00B7 1:00 pm - 2:00 pm");
});

test("getFormattedEventInterval different days, with time", () => {
  expect(
    getFormattedEventInterval("2020-06-24 20:00:00", "2020-06-25 01:00:00")
  ).toBe("Wed, Jun 24 \u00B7 8:00 pm - Thu, Jun 25 \u00B7 1:00 am");
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
