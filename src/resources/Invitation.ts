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
      approvedId: false,
      deniedId: false,
    }
  ) {
    Object.assign(this, inv);
  }
}

export const invitationIsUnanswered = (
  invitation: Invitation,
  user: User
): boolean =>
  !invitation.invitees.some(function (invitee) {
    // Get Invitations where user has yet to respond or are waiting for approval
    if (invitee.id === user.id && (invitee.accepted || invitee.rejected)) {
      return true;
    } else return false;
  });

export const invitationIsPendingApproval = (
  invitation: Invitation
): boolean => {
  return !invitation.approvedId && !invitation.deniedId;
};

export const getUnansweredInvitations = (
  user: User,
  invitations: Invitation[]
): Invitation[] =>
  invitations.filter(({ invitees }) => {
    const u = invitees.find(({ id }) => id === user.id);
    return u && !u.accepted && !u.rejected;
  });

export default Invitation;
