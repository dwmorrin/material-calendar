export interface GroupMember {
  username: string;
  name: {
    first: string;
    middle?: string;
    last: string;
  };
  email: string;
}
interface UserGroup {
  [k: string]: unknown;
  id: number;
  title: string;
  projectId: number;
  members: GroupMember[];
  reservedHours: number;
}

class UserGroup implements UserGroup {
  static url = "/api/groups";
  constructor(
    group = {
      id: 0,
      projectId: 0,
      title: "",
      members: [] as GroupMember[],
      reservedHours: 0,
    }
  ) {
    Object.assign(this, group);
  }
}

export default UserGroup;
