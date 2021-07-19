import User from "./User";

export interface Invitation {
  id: number;
  confirmed: number;
  project: number;
  invitor: { id: number; name: { last: string; first: string }; email: string };
  invitees: {
    id: number;
    accepted: number;
    rejected: number;
    name: { last: string; first: string };
  }[];
  group_id: number;
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
