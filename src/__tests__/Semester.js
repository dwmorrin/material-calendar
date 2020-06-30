import Semester from "../resources/Semester";

test("Semester default start is falsy", () =>
  expect(new Semester().start).toBeFalsy());
