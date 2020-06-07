export interface GroupMember {
  username: string;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
}
interface UserGroup {
  [k: string]: unknown;
  id: number;
  projectId: number;
  members: GroupMember[];
  reservedHours: number;
}

class UserGroup implements UserGroup {
  static url = "/api/users/groups";
  constructor(
    group = {
      id: 0,
      projectId: 0,
      members: [] as GroupMember[],
    }
  ) {
    Object.assign(this, group);
  }
}

export default UserGroup;
