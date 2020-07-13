import User from "../resources/User";

export function makeManagerList(
  managers: Pick<User, "id" | "name" | "username">[]
): string[] {
  return managers.map((manager) => manager.username);
}
