import { Action, CalendarAction } from "../../calendar/types";
import Invitation from "../../resources/Invitation";
import Project from "../../resources/Project";
import { ResourceKey } from "../../resources/types";
import User from "../../resources/User";
import UserGroup from "../../resources/UserGroup";
import { Mail, groupTo } from "../../utils/mail";

interface CreateInvitationProps {
  invitor: User;
  invitees: User[];
  project: Project;
  approved: boolean;
  dispatch: (a: Action) => void;
  setSelectedUsers: (users: User[]) => void;
}

const createInvitation = ({
  invitor,
  invitees,
  project,
  approved,
  dispatch,
  setSelectedUsers,
}: CreateInvitationProps): Promise<void> => {
  const group = new UserGroup({
    id: 0,
    projectId: project.id,
    title: "",
    members: invitees,
    reservedHours: 0,
  });

  const name = User.formatName(invitor.name);

  const mail: Mail = {
    to: groupTo(invitees),
    subject: "You have been invited to a group",
    text: `${name} has invited you to join their group for ${project.title}`,
  };
  return fetch(UserGroup.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invitation: {
        invitorId: invitor.id,
        invitees: invitees.map(({ id }) => id),
        projectId: project.id,
        approved,
        mail,
      },
      group,
    }),
  })
    .then((response) => response.json())
    .then(({ error, data }) => {
      if (error) throw error;
      const groups: UserGroup[] = data.groups;
      const invitations: Invitation[] = data.invitations;
      if (!Array.isArray(groups)) throw new Error("No group info received");
      if (!Array.isArray(invitations))
        throw new Error("No invitation info received");
      dispatch({
        type: CalendarAction.CreatedInvitationReceived,
        payload: {
          resources: {
            [ResourceKey.Groups]: groups.map((g) => new UserGroup(g)),
          },
          invitations: invitations.map((i) => new Invitation(i)),
        },
      });
      setSelectedUsers([]);
    })
    .catch((error) =>
      dispatch({ type: CalendarAction.Error, payload: { error } })
    );
};

export default createInvitation;
