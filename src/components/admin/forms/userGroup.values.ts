import { ResourceKey } from "../../../resources/types";
import User from "../../../resources/User";
import UserGroup from "../../../resources/UserGroup";
import { AdminState } from "../../../admin/types";

interface UserGroupValues extends Record<string, unknown> {
  id: number;
  title: string;
  projectId: string;
  creatorId: string;
  pending: boolean;
  abandoned: boolean;
  members: string[];
  exceptionalSize: boolean;
  reservedHours: number;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const group = state.resourceInstance as UserGroup;
  return {
    id: group.id,
    title: group.title,
    projectId: String(group.projectId),
    creatorId: String(group.creatorId),
    pending: group.pending,
    abandoned: group.abandoned,
    members: group.members.map(({ username }) => username),
    reservedHours: group.reservedHours,
  } as UserGroupValues;
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): UserGroup => {
  const {
    id,
    projectId,
    members,
    title,
    reservedHours,
    pending,
    abandoned,
    exceptionalSize,
    creatorId,
  } = values as UserGroupValues;
  const users = state.resources[ResourceKey.Users] as User[];
  const _members = members.map((_username) => {
    const { id, username, name, email } =
      users.find((user) => user.username === _username) || new User();
    return {
      id,
      username,
      name,
      email,
      invitation: { accepted: false, rejected: false },
    };
  });
  return {
    id,
    title,
    projectId: Number(projectId),
    creatorId: Number(creatorId),
    pending,
    abandoned,
    members: _members,
    exceptionalSize,
    reservedHours,
  };
};
