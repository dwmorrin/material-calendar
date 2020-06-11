import Semester from "../admin/resources/Semester";

test("Semester default start is falsy", () =>
  expect(new Semester().start).toBeFalsy());
