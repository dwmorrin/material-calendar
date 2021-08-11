import { CalendarUIProps } from "../../calendar/types";
import User from "../../resources/User";
import Project from "../../resources/Project";
import Invitation from "../../resources/Invitation";
import UserGroup from "../../resources/UserGroup";

type BaseInvitationListProps = {
  invitations: Invitation[];
  user: User;
};

export type InvitationItemProps = Omit<CalendarUIProps, "state"> & {
  currentProject: Project;
  invitation: Invitation;
  user: User;
};

export type InvitationListProps = Omit<CalendarUIProps, "state"> &
  BaseInvitationListProps & {
    currentProject: Project;
  };

export type GroupInfoProps = CalendarUIProps &
  BaseInvitationListProps & {
    currentGroup: UserGroup;
  };

export type StateModifierProps = {
  openConfirmationDialog: (open: boolean) => void;
  user: User;
  selectedUsers: User[];
  setSelectedUsers: (u: User[]) => void;
};
