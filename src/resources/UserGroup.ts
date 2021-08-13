export interface GroupMember {
  id: number;
  username: string;
  name: {
    first: string;
    middle: string;
    last: string;
  };
  invitation: {
    accepted: boolean;
    rejected: boolean;
  };
  email: string;
}
interface UserGroup extends Record<string, unknown> {
  id: number;
  title: string;
  projectId: number;
  creatorId: number;
  pending: boolean;
  abandoned: boolean;
  members: GroupMember[];
  reservedHours: number;
}

// private helper function to dynamically generate group titles if none exist
const makeTitle = (members: GroupMember[]): string => {
  if (members.length === 1) {
    return members[0].name.first + " " + members[0].name.last;
  }
  const lastNames = members.map((member) => member.name.last);
  if (lastNames.length < 3) {
    return lastNames.join(" and ");
  }
  return lastNames.slice(0, -1).join(", ") + ", and " + lastNames.slice(-1);
};

class UserGroup implements UserGroup {
  static url = "/api/groups";
  constructor(
    group = {
      id: 0,
      title: "",
      projectId: 0,
      creatorId: 0,
      pending: true,
      abandoned: false,
      members: [] as GroupMember[],
      reservedHours: 0,
    }
  ) {
    Object.assign(this, group);
    if (!this.title) {
      this.title = makeTitle(this.members);
    }
  }
}

export default UserGroup;
