import User from "../../resources/User";

const template = (user: unknown): string[][] =>
  user instanceof User
    ? [
        ["Username", user.username],
        ["Name", user.name ? [user.name.first, user.name.last].join(" ") : ""],
        ["Roles", user.roles.join(", ")],
        [
          "Email",
          user.contact.email?.length ? user.contact.email.join(", ") : "none",
        ],
        [
          "Projects",
          user.projects?.length ? user.projects.length.toString() : "0",
        ],
      ]
    : [["", JSON.stringify(user)]];
export default template;
