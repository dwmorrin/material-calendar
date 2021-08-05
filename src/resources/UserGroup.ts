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
  static makeTitle(members: GroupMember[]): string {
    if (members.length === 1) {
      return members[0].name.first + " " + members[0].name.last;
    }
    const lastNames = members.map((member) => member.name.last);
    if (lastNames.length < 3) {
      return lastNames.join(" and ");
    }
    return lastNames.slice(0, -1).join(", ") + ", and " + lastNames.slice(-1);
  }
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
    if (!this.title) {
      this.title = UserGroup.makeTitle(this.members);
    }
  }
}

export default UserGroup;
