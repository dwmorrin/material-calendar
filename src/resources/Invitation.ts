import User from "./User";

interface Invitor {
  id: number;
  name: { last: string; first: string };
  email: string;
}

interface Invitee {
  id: number;
  accepted: boolean;
  rejected: boolean;
  name: { last: string; first: string };
  email: string;
}
interface Invitation {
  id: number;
  confirmed: boolean;
  projectId: number;
  invitor: Invitor;
  invitees: Invitee[];
  groupId: number;
  approvedId: boolean;
  deniedId: boolean;
}

class Invitation implements Invitation {
  static url = "/api/invitations";
  constructor(
    inv = {
      id: 0,
      confirmed: false,
      projectId: 0,
      invitor: { id: 0, name: { last: "", first: "" }, email: "" } as Invitor,
      invitees: [] as Invitee[],
      groupId: 0,
      approved: false,
      denied: false,
    }
  ) {
    Object.assign(this, inv);
  }
}
export function getUnansweredInvitations(
  user: User,
  invitations: Invitation[]
): Invitation[] {
  return invitations.filter((inv) => {
    const u = inv.invitees.find(({ id }) => id === user.id);
    return u && !u.accepted && !u.rejected;
  });
}

export default Invitation;
