import { ResourceKey, ResourceInstance } from "../../resources/types";
import { SnackbarState } from "../../components/Snackbar";
import Semester from "../../resources/Semester";
import FullCalendar from "@fullcalendar/react";
import Location from "../../resources/Location";

export interface Action {
  type: AdminAction;
  payload?: Partial<AdminState>;
  error?: boolean;
  meta?: unknown;
}

export enum AdminAction {
  AddProjectToLocationSuccess,
  CloseAddProjectToLocation,
  CloseAppInspection,
  CloseBackups,
  CloseDetail,
  CloseExceptionsDashboard,
  CloseFileImport,
  CloseImportClassMeetingDialog,
  CloseImportRoster,
  CloseLocationHoursDialog,
  CloseProjectLocationHoursDialog,
  CloseProjectLocationHoursSummaryDialog,
  CloseSemesterDialog,
  CloseSnackbar,
  CloseUserGroupDashboard,
  CloseVirtualWeekModifyDialog,
  CloseVirtualWeeksDialog,
  Error,
  FileImportSuccess,
  OpenAddProjectToLocation,
  OpenAppInspection,
  OpenBackups,
  OpenDetail,
  OpenDetailWithProjectById,
  OpenDetailWithResourceInstance,
  OpenExceptionsDashboard,
  OpenImportClassMeetings,
  OpenImportRoster,
  OpenLocationHoursDialog,
  OpenProjectLocationHoursDialog,
  OpenProjectLocationHoursSummaryDialog,
  OpenScheduler,
  OpenSemesterDialog,
  OpenUserGroupDashboard,
  OpenVirtualWeekModifyDialog,
  OpenedClassMeetingsFile,
  OpenedFile,
  ReceivedAllResources,
  ReceivedResource,
  ReceivedResourcesAfterLocationHoursUpdate,
  ReceivedResourcesAfterProjectLocationHoursUpdate,
  ReceivedResourcesAfterVirtualWeekUpdate,
  SelectedDocument,
  SelectedRecordPage,
  SelectedResource,
  SelectedSchedulerLocation,
  SelectedSemester,
  SubmittingDocument,
  ToggleDrawer,
}

export interface AdminState {
  // UI state
  addProjectToLocationIsOpen: boolean;
  appInspectionIsOpen: boolean;
  appIsBroken: boolean;
  backupsIsOpen: boolean;
  calendarEventClickState?: CalendarEventClickState;
  calendarSelectionState?: CalendarSelectionState;
  detailIsOpen: boolean;
  drawerIsOpen: boolean;
  error?: Error;
  exceptionsDashboardIsOpen: boolean;
  importClassMeetingsIsOpen: boolean;
  importRosterIsOpen: boolean;
  fileImportIsOpen: boolean;
  initialResourcesPending: boolean;
  locationHoursDialogIsOpen: boolean;
  projectLocationHoursDialogIsOpen: boolean;
  projectLocationHoursSummaryDialogIsOpen: boolean;
  recordPage: number;
  ref: React.RefObject<FullCalendar> | null;
  schedulerIsOpen: boolean;
  semesterDialogIsOpen: boolean;
  snackbarQueue: SnackbarState[];
  userGroupDashboardIsOpen: boolean;
  virtualWeekModifyDialogIsOpen: boolean;
  virtualWeeksDialogIsOpen: boolean;

  // resources
  selectedSemester?: Semester;
  resourceFile?: string | ArrayBuffer | null;
  resourceKey: ResourceKey;
  resourceInstance?: ResourceInstance;
  resources: { [k in ResourceKey]: ResourceInstance[] };
}

export type AdminUIProps = {
  dispatch: (action: Action) => void;
  state: AdminState;
};

export interface FormTemplateProps {
  values: Record<string, unknown>;
  state: AdminState;
}

export interface CalendarSelectionState {
  title?: string;
  start: string;
  end: string;
  location: Location;
  resource: { extendedProps: Record<string, unknown> };
}

export interface CalendarEventClickState {
  title: string;
  startStr: string;
  endStr: string;
  extendedProps: Record<string, unknown>;
}

export interface ApiResponse {
  error?: Error;
  data?: unknown;
  context?: unknown;
}

export interface AdminSelections {
  locationId: number;
  semesterId: number;
}

export interface AdminSelectionProps {
  selections: AdminSelections;
  setSelections: (selections: AdminSelections) => void;
}
