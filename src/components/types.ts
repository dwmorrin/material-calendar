import Event from "../resources/Event";
import Project from "../resources/Project";
import FullCalendar from "@fullcalendar/react";
import UserGroup from "../resources/UserGroup";
import { ResourceKey, ResourceInstance } from "../resources/types";
import { SnackbarState } from "../components/Snackbar";

export enum CalendarAction {
  CanceledInvitationReceived,
  CanceledReservation,
  CloseEquipmentForm,
  CloseEventDetail,
  CloseEventEditor,
  CloseGroupDashboard,
  CloseHelpDialog,
  CloseProjectDashboard,
  CloseProjectForm,
  CloseReservationForm,
  CloseReservationFormAdmin,
  CloseSnackbar,
  CreatedEventsReceived,
  CreatedInvitationReceived,
  DeletedOneEvent,
  DisplayMessage,
  Error,
  EventLock,
  EventUnlock,
  FoundStaleCurrentEvent,
  JoinedGroup,
  LeftGroup,
  NavigateBefore,
  NavigateNext,
  OpenEventDetail,
  OpenEventEditor,
  OpenGroupDashboard,
  OpenHelpDialog,
  OpenProjectDashboard,
  OpenProjectForm,
  OpenReservationForm,
  OpenReservationFormAdmin,
  PickedDate,
  ReceivedAdminReservationUpdate,
  ReceivedAllResources,
  ReceivedInvitations,
  ReceivedReservationCancelation,
  ReceivedReservationUpdate,
  ReceivedResource,
  RejectedGroupInvitation,
  SelectedEvent,
  SelectedGroup,
  SelectedLocation,
  SelectedProject,
  SentInvitations,
  ToggleDrawer,
  TogglePicker,
  UpdatedEditedEventReceived,
  UpdatedOneEvent,
  UpdatedOneGroup,
  UpdatedOneProject,
  UpdatedOneReservation,
  ViewToday,
}

export type CalendarView =
  | "dayGridMonth"
  | "listWeek"
  | "resourceTimeGridDay"
  | "resourceTimeGridWeek";

export interface CalendarState {
  // UI state
  appIsBroken: boolean;
  currentStart: string;
  detailIsOpen: boolean;
  drawerIsOpen: boolean;
  eventEditorIsOpen: boolean;
  error?: Error;
  helpDialogIsOpen: boolean;
  message: string;
  groupDashboardIsOpen: boolean;
  initialResourcesPending: boolean;
  pickerShowing: boolean;
  projectDashboardIsOpen: boolean;
  reservationFormIsOpen: boolean;
  reservationFormAdminIsOpen: boolean;
  projectFormIsOpen: boolean;
  ref: React.RefObject<FullCalendar> | null;
  snackbarQueue: SnackbarState[];

  // Resources
  resources: { [k in ResourceKey]: ResourceInstance[] };
  currentEvent?: Event;
  currentGroup?: UserGroup;
  currentProject?: Project;
  currentCourse?: { id: number; title: string };
}

export type PartialCalendarState = Partial<Omit<CalendarState, "resources">> & {
  resources?: { [k: number]: ResourceInstance[] };
};

// https://github.com/redux-utilities/flux-standard-action
export interface Action {
  type: CalendarAction;
  payload?: PartialCalendarState;
  error?: boolean;
  meta?: unknown;
}

export type CalendarUIProps = {
  dispatch: (action: Action) => void;
  state: CalendarState;
};

export type ApiResponse = {
  error?: Error;
  data?: unknown;
  context?: unknown;
};

export type CalendarSelections = {
  locationIds: number[];
  projectIds: number[];
  calendarView: CalendarView;
};

export type CalendarUISelectionProps = {
  selections: CalendarSelections;
  setSelections: (s: CalendarSelections) => void;
};
