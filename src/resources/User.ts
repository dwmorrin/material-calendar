interface User {
  [k: string]: unknown;
  username: string; // unique to each user
  roles: string[]; // admin, user, etc
  name?: {
    first?: string;
    middle?: string;
    last?: string;
  };
  contact: {
    email?: string[];
    phone?: string[];
  };
}

class User implements User {
  static url = "/api/users";
  constructor(
    user = {
      username: "",
      contact: {},
      roles: [] as string[],
    }
  ) {
    Object.assign(this, user);
  }
}

export default User;
