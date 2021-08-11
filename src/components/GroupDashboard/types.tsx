import { CalendarUIProps } from "../../calendar/types";
import User from "../../resources/User";
import Project from "../../resources/Project";
import Invitation from "../../resources/Invitation";
import UserGroup from "../../resources/UserGroup";

type CalendarUIDispatcher = Omit<CalendarUIProps, "state">;

export type InvitationItemProps = CalendarUIDispatcher & {
  currentProject: Project;
  invitation: Invitation;
  user: User;
};

export type InvitationListProps = CalendarUIDispatcher & {
  currentProject: Project;
  invitations: Invitation[];
  user: User;
};

export type GroupInfoProps = CalendarUIDispatcher & {
  group: UserGroup;
  project: Project;
  user: User;
};

export type StateModifierProps = {
  openConfirmationDialog: (open: boolean) => void;
  selectedUsers: User[];
  setSelectedUsers: (u: User[]) => void;
  user: User;
};
