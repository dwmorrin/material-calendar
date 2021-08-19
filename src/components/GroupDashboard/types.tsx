import { CalendarUIProps } from "../../calendar/types";
import User from "../../resources/User";
import Project from "../../resources/Project";
import UserGroup from "../../resources/UserGroup";

type CalendarUIDispatcher = Omit<CalendarUIProps, "state">;

export type InvitationItemProps = CalendarUIDispatcher & {
  project: Project;
  pendingGroup: UserGroup;
  user: User;
  setProjectMembers: (u: User[]) => void;
};

export type InvitationListProps = CalendarUIDispatcher & {
  myInvitation?: UserGroup;
  currentProject: Project;
  pendingGroups: UserGroup[];
  user: User;
  setProjectMembers: (u: User[]) => void;
};

export type GroupInfoProps = CalendarUIDispatcher & {
  group: UserGroup;
  project: Project;
  user: User;
  setProjectMembers: (u: User[]) => void;
};

export type StateModifierProps = CalendarUIDispatcher & {
  openConfirmationDialog: (open: boolean) => void;
  selectedUsers: User[];
  setSelectedUsers: (u: User[]) => void;
  user: User;
};
