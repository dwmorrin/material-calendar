import UserGroup, { GroupMember } from "../../../resources/UserGroup";
import Project from "../../../resources/Project";
import { AdminState } from "../../../admin/types";
import { ResourceKey } from "../../../resources/types";
import { parseAndFormatSQLDateInterval } from "../../../utils/date";

const nameReducer = (s: string, groupMember: GroupMember): string =>
  s ? `${s}, ${groupMember.username}` : groupMember.username;

const template = (userGroup: unknown, state: AdminState): string[][] => {
  if (userGroup instanceof UserGroup) {
    const projects = state.resources[ResourceKey.Projects] as Project[];
    const project =
      projects.find(({ id }) => id === userGroup.projectId) || new Project();
    return [
      ["ID", userGroup.id.toString()],
      ["Title", userGroup.title],
      ["Project", project.title],
      ["Interval", parseAndFormatSQLDateInterval(project)],
      ["Members", userGroup.members.reduce(nameReducer, "")],
    ];
  } else {
    return [["", JSON.stringify(userGroup)]];
  }
};

export default template;
