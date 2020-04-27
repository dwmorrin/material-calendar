interface UserGroup {
  id: number;
  projectId: number;
  memberIds: string | string[];
  memberNames: string | string[];
}

class UserGroup implements UserGroup {
  public title: string;
  constructor(group: UserGroup) {
    this.id = group.id;
    this.projectId = group.projectId;
    this.memberIds = this.inflate(group.memberIds);
    this.memberNames = this.inflate(group.memberNames);
    this.title = this.memberNames.join(", ");
  }

  inflate(s?: string | string[]): string[] {
    if (!s) return [];
    if (Array.isArray(s)) return s;
    try {
      return JSON.parse(s);
    } catch (error) {
      return [];
    }
  }
}

export default UserGroup;
