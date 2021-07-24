import User from "./User";

interface Invitor {
  id: number;
  name: { last: string; first: string };
  email: string;
}

interface Invitee {
  id: number;
  accepted: number;
  rejected: number;
  name: { last: string; first: string };
  email: string;
}
interface Invitation {
  id: number;
  confirmed: number;
  project: number;
  invitor: Invitor;
  invitees: Invitee[];
  group_id: number;
  approved: boolean;
  denied: boolean;
}

class Invitation implements Invitation {
  static url = "/api/invitations";
  constructor(
    inv = {
      id: 0,
      confirmed: 0,
      project: 0,
      invitor: { id: 0, name: { last: "", first: "" }, email: "" } as Invitor,
      invitees: [] as Invitee[],
      group_id: 0,
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
    return u && u.accepted === 0 && u.rejected === 0;
  });
}

export default Invitation;
