interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: number;
  groupIds: number[];
  projectIds: number[];
}

class User {
  constructor(user: User) {
    Object.assign(this, user);
  }
}

export default User;
