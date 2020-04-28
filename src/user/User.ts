import inflate from "../util/inflate";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: number;
  groupIds: (string | number)[];
  projectIds: (string | number)[];
}

class User {
  constructor(user: User) {
    Object.assign(this, user);
    this.groupIds = inflate(this.groupIds);
    this.projectIds = inflate(this.projectIds);
  }
}

export default User;
