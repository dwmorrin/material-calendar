import User from "../resources/User";

const defaultUser = new User();

test("default username is falsy", () => {
  expect(defaultUser.username).toBeFalsy();
});

test("default roles do not include admin", () => {
  expect(defaultUser.roles).toEqual(expect.not.arrayContaining(["admin"]));
});
