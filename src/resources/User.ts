interface User {
  [k: string]: unknown;
  id: number;
  username: string; // unique to each user
  roles: string[]; // admin, user, etc
  name: {
    first: string;
    middle: string;
    last: string;
  };
  email: string;
  phone: string;
  projects: { id: number; title: string; groupId: number }[];
  restriction: number;
}

class User implements User {
  static url = "/api/users";
  constructor(
    user = {
      id: 0,
      username: "",
      email: "",
      phone: "",
      roles: [] as string[],
      name: {
        first: "",
        middle: "",
        last: "",
      },
      projects: [] as { id: number; title: string; groupId: number }[],
      restriction: 0,
    }
  ) {
    Object.assign(this, user);
  }
}

export default User;
