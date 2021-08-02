import { ResourceKey } from "../../resources/types";
import User from "../../resources/User";
import UserGroup from "../../resources/UserGroup";
import { AdminState } from "../types";

interface UserGroupValues extends Record<string, unknown> {
  id: number;
  projectId: string;
  members: string[];
  title: string;
  reservedHours: number;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const group = state.resourceInstance as UserGroup;
  return {
    id: group.id,
    projectId: String(group.projectId),
    members: group.members.map(({ username }) => username),
    title: group.title,
    reservedHours: group.reservedHours,
  } as UserGroupValues;
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): UserGroup => {
  const { id, projectId, members, title, reservedHours } =
    values as UserGroupValues;
  const users = state.resources[ResourceKey.Users] as User[];
  const _members = members.map((_username) => {
    const { username, name, email } =
      users.find((user) => user.username === _username) || new User();
    return { username, name, email };
  });
  return {
    id,
    projectId: Number(projectId),
    members: _members,
    title,
    reservedHours,
  };
};
