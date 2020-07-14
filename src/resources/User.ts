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

export type Manager = Pick<User, "id" | "name" | "username">;

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

  static getManagerUsernames(managers: Manager[]): string[] {
    return managers.map(({ username }) => username);
  }

  static getManagerNames(managers: Manager[]): string[] {
    return managers.map(({ name, username }) => {
      if (name && name.first && name.last) return `${name.first} ${name.last}`;
      return username;
    });
  }
}

export default User;
