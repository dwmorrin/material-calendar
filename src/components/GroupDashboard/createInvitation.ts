import { Action, CalendarAction } from "../types";
import Project from "../../resources/Project";
import { ResourceKey } from "../../resources/types";
import User from "../../resources/User";
import UserGroup from "../../resources/UserGroup";
import { Mail, groupTo } from "../../utils/mail";

interface CreateGroupProps {
  invitor: User;
  invitees: User[];
  project: Project;
  approved: boolean;
  dispatch: (a: Action) => void;
  setSelectedUsers: (users: User[]) => void;
  setProjectMembers: (users: User[]) => void;
}

type CreateGroupRequest = {
  title: string;
  projectId: number;
  members: number[];
  approved: boolean;
  mail: Mail;
};

const createGroup = ({
  invitor,
  invitees,
  project,
  approved,
  dispatch,
  setSelectedUsers,
  setProjectMembers,
}: CreateGroupProps): Promise<void> => {
  invitees.push(invitor);
  const name = User.formatName(invitor.name);
  const mail: Mail = {
    to: groupTo(invitees),
    subject: "You have been invited to a group",
    text: `${name} has invited you to join their group for ${project.title}`,
  };
  const request: CreateGroupRequest = {
    title: UserGroup.makeTitle(invitees),
    projectId: project.id,
    members: invitees.map(({ id }) => id),
    approved,
    mail,
  };
  return fetch(UserGroup.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })
    .then((response) => response.json())
    .then(({ error, data }) => {
      if (error) throw error;
      const groups: UserGroup[] = data.groups;
      const members: User[] = data.members;
      if (!Array.isArray(groups)) throw new Error("No group info received");
      if (!Array.isArray(members))
        throw new Error("No project member info received");
      setProjectMembers(members.map((m) => new User(m)));
      dispatch({
        type: CalendarAction.CreatedInvitationReceived,
        payload: {
          resources: {
            [ResourceKey.Groups]: groups.map((g) => new UserGroup(g)),
          },
        },
      });
    })
    .catch((error) =>
      dispatch({ type: CalendarAction.Error, payload: { error } })
    )
    .finally(() => setSelectedUsers([]));
};

export default createGroup;
