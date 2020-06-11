import UserGroup, { GroupMember } from "../../resources/UserGroup";

const nameReducer = (s: string, groupMember: GroupMember): string =>
  s ? `${s}, ${groupMember.username}` : groupMember.username;

const template = (userGroup: unknown): string[][] =>
  userGroup instanceof UserGroup
    ? [
        ["Project", userGroup.projectId.toString()],
        ["Members", userGroup.members.reduce(nameReducer, "")],
      ]
    : [["", JSON.stringify(userGroup)]];
export default template;
