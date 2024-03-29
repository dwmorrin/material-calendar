import User from "./User";

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
  members: GroupMember[];
  exceptionalSize: boolean;
  reservedHours: number;
}

class UserGroup implements UserGroup {
  static url = "/api/groups";
  static invitationUrls = {
    cancel(group: UserGroup): string {
      return `${UserGroup.url}/${group.id}/invitation`;
    },
    create(): string {
      return `${UserGroup.url}/invitation`;
    },
    update(group: UserGroup): string {
      return `${UserGroup.url}/${group.id}/invitation`;
    },
  };
  static exceptionUrl = {
    size(g: UserGroup): string {
      return `${UserGroup.url}/admin/exceptions/size/${g.id}`;
    },
  };

  constructor(
    group = {
      id: 0,
      title: "",
      projectId: 0,
      creatorId: 0,
      pending: true,
      members: [] as GroupMember[],
      exceptionalSize: false,
      reservedHours: 0,
    }
  ) {
    Object.assign(this, group);
    if (!this.title) {
      this.title = UserGroup.makeTitle(this.members);
    }
  }

  static makeTitle = (
    members: { name: { first: string; last: string } }[]
  ): string => {
    if (members.length === 0) {
      return "";
    }
    if (members.length === 1) {
      return User.formatName(members[0].name);
    }
    const names = members.map(({ name }) => User.formatName(name));
    if (members.length === 2) {
      return names.join(" and ");
    }
    return [names.slice(0, -1).join(", "), names.slice(-1)].join(", and ");
  };
}

export default UserGroup;
