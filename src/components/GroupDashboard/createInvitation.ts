import { Action, CalendarAction } from "../../calendar/types";
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
      if (!Array.isArray(groups)) throw new Error("No group info received");
      dispatch({
        type: CalendarAction.CreatedInvitationReceived,
        payload: {
          resources: {
            [ResourceKey.Groups]: groups.map((g) => new UserGroup(g)),
          },
        },
      });
      setSelectedUsers([]);
    })
    .catch((error) =>
      dispatch({ type: CalendarAction.Error, payload: { error } })
    );
};

export default createGroup;
