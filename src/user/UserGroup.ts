import inflate from "../util/inflate";

interface UserGroup {
  id: number;
  projectId: number;
  memberIds: string | (string | number)[];
  memberNames: string | string[];
}

class UserGroup implements UserGroup {
  public title: string;
  constructor(group: UserGroup) {
    this.id = group.id;
    this.projectId = group.projectId;
    this.memberIds = inflate(group.memberIds);
    this.memberNames = inflate(group.memberNames);
    this.title = this.memberNames.join(", ");
  }
}

export default UserGroup;
