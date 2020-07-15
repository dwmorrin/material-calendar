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
  title: string;
  projectId: number;
  members: GroupMember[];
  reservedHours: number;
}

class UserGroup implements UserGroup {
  static makeTitle(members: GroupMember[]): string {
    const lastNames = members.map((member) => member.name.last);
    return lastNames.slice(0, -1).join(", ") + ", and " + lastNames.slice(-1);
  }
  static url = "/api/users/groups";
  constructor(
    group = {
      id: 0,
      projectId: 0,
      members: [] as GroupMember[],
    }
  ) {
    Object.assign(this, group);
    this.title = UserGroup.makeTitle(this.members);
  }
}

export default UserGroup;
