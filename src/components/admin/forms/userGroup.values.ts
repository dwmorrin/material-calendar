import { ResourceKey } from "../../../resources/types";
import User from "../../../resources/User";
import UserGroup from "../../../resources/UserGroup";
import { AdminState } from "../types";

interface UserGroupValues extends Record<string, unknown> {
  id: number;
  title: string;
  projectId: string;
  creatorId: string;
  pending: boolean;
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
    exceptionalSize,
    creatorId,
  } = values as UserGroupValues;
  const users = state.resources[ResourceKey.Users] as User[];
  return {
    id,
    title,
    projectId: Number(projectId),
    creatorId: Number(creatorId),
    pending,
    members: members.map((formUsername) => {
      const cleanedUsername = formUsername.trim();
      const { id, username, name, email } =
        users.find((user) => user.username === cleanedUsername) || new User();
      return {
        id,
        username,
        name,
        email,
        invitation: { accepted: false, rejected: false },
      };
    }),
    exceptionalSize,
    reservedHours,
  };
};
