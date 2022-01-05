import User from "../../../resources/User";
import { AdminState } from "../types";

export interface UserValues extends Record<string, unknown> {
  id: number;
  username: string;
  password: { reset: boolean; value: string };
  roles: Record<string, boolean>;
  name: {
    first: string;
    middle: string;
    last: string;
  };
  email: string;
  phone: string;
  restriction: string;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const user = state.resourceInstance as User;
  return {
    id: user.id,
    username: user.username,
    password: { reset: false, value: "" },
    roles: {
      admin: user.roles.includes("admin"),
      user: user.roles.includes("user"),
    }, // TODO: get roles from database
    name: user.name,
    email: user.email,
    phone: user.phone,
    restriction: String(user.restriction),
  };
};

/**
 * Upon form submit, this function "un-does" the values function
 * and returns something suitable to send off to the database
 */
export const update = (
  state: AdminState,
  values: Record<string, unknown>
): User => {
  const user = new User(state.resourceInstance as User);
  const { username, roles, name, email, phone, restriction, password } =
    values as UserValues;

  const selectedRoles = Object.entries(roles).reduce(
    (res, [role, selected]) => (selected ? [...res, role] : res),
    [] as string[]
  );

  //! SIDE EFFECT - don't like this, but not sure what else to do at this point
  if (password.reset) {
    fetch(`${User.url}/${user.id}/reset`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: password.value,
      }),
    })
      .then((res) => res.json())
      .then(console.log)
      .catch(console.error);
  }

  return {
    id: user.id,
    username,
    name,
    email,
    phone,
    roles: selectedRoles,
    projects: user.projects, // ignored; use roster records to update this
    restriction: Number(restriction),
  };
};
