// TODO implement ability to add/remove users from projects

import User from "../../resources/User";
import { AdminState } from "../types";
import { ResourceKey } from "../../resources/types";
import Project from "../../resources/Project";

const getSelectedProjectIds = (
  projects: Project[],
  selected: Record<string, boolean>
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

export const values = (state: AdminState): Record<string, unknown> => {
  const user = state.resourceInstance as User;
  return {
    ...user,
  };
};

/**
 * Upon form submit, this function "un-does" the values function
 * and returns something suitable to send off to the database
 */
export const update = (
  state: AdminState,
  values: Record<string, unknown>
): User => ({
  ...new User(state.resourceInstance as User),
  ...values,
  //! TODO this has not been updated since changing the template!!
  projects: getSelectedProjectIds(
    state.resources[ResourceKey.Projects] as Project[],
    values.projects as Record<string, boolean>
  ),
});
