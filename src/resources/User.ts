interface User {
  [k: string]: unknown;
  id: number;
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
  projects?: { id: number; title: string; groupId: number }[];
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

  static isAdmin(user?: User): boolean {
    if (!user) return false;
    return user.roles.includes("admin");
  }
  static isManager(user?: User): boolean {
    if (!user) return false;
    return user.roles.includes("manager");
  }
}

export default User;
