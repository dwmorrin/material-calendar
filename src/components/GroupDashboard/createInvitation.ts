import { Action, CalendarAction } from "../../calendar/types";
import Invitation from "../../resources/Invitation";
import Project from "../../resources/Project";
import User from "../../resources/User";
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
  const name = User.formatName(invitor.name);

  const mail: Mail = {
    to: groupTo(invitees),
    subject: "You have been invited to a group",
    text: `${name} has invited you to join their group for ${project.title}`,
  };
  return fetch(`${Invitation.url}/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      invitorId: invitor.id,
      invitees: invitees.map(({ id }) => id),
      projectId: project.id,
      approved,
      mail,
    }),
  })
    .then((response) => response.json())
    .then(({ error, data }) => {
      if (error) throw error;
      if (!Array.isArray(data)) throw new Error("No invitation info received");
      dispatch({
        type: CalendarAction.ReceivedInvitations,
        payload: {
          invitations: (data as Invitation[]).map((i) => new Invitation(i)),
        },
      });
      setSelectedUsers([]);
    })
    .catch((error) =>
      dispatch({ type: CalendarAction.Error, payload: { error } })
    );
};

export default createInvitation;
