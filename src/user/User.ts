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
  }
}

export default User;
