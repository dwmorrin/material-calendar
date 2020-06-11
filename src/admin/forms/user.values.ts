// TODO implement ability to add/remove users from projects

import User from "../../resources/User";
import { AdminState, FormValues, ValueDictionary } from "../types";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";

const makeSelectedProjectDict = (
  projects: Project[],
  user: User
): ValueDictionary =>
  projects.reduce(
    (dictionary: ValueDictionary, project): ValueDictionary =>
      dictionary
        ? {
            ...dictionary,
            [project.title]: user.projects
              ? (user.projects as Partial<Project>[]).findIndex(
                  (p) => p.id === project.id
                ) > -1
              : false,
          }
        : {},
    {}
  );

const getSelectedProjectIds = (
  projects: Project[],
  selected: ValueDictionary
): { id: number; title: string; groupId: number }[] =>
  projects
    .filter((p) => selected[p.title])
    .reduce(
      (userProjects: { id: number; title: string; groupId: number }[], p) => [
        ...userProjects,
        { id: p.id, title: p.title, groupId: 0 },
      ],
      []
    );

export const values = (state: AdminState): FormValues => {
  const user = state.resourceInstance as User;
  const name = user.name
    ? {
        first: user.name.first || "",
        middle: user.name.middle || "",
        last: user.name.last || "",
      }
    : { first: "", middle: "", last: "" };
  const contact = {
    email: user.contact.email || [],
    phone: user.contact.phone || [],
  };

  return {
    ...user,
    name,
    contact,
    projects: makeSelectedProjectDict(
      state.resources[ResourceKey.Projects] as Project[],
      user
    ),
  };
};

/**
 * Upon form submit, this function "un-does" the values function
 * and returns something suitable to send off to the database
 */
export const update = (state: AdminState, values: FormValues): User => ({
  ...new User(state.resourceInstance as User),
  ...values,
  projects: getSelectedProjectIds(
    state.resources[ResourceKey.Projects] as Project[],
    values.projects as ValueDictionary
  ),
});
