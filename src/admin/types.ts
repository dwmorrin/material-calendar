import { ResourceKey, ResourceInstance } from "../resources/types";
import { SnackbarState } from "../components/Snackbar";
import Semester from "../resources/Semester";
import FullCalendar from "@fullcalendar/react";
import Location from "../resources/Location";

export interface Action {
  type: AdminAction;
  payload?: Partial<AdminState>;
  error?: boolean;
  meta?: unknown;
}

export enum AdminAction {
  CloseAllotmentSummaryDialog,
  CloseAllotmentDialog,
  CloseBackups,
  CloseDetail,
  CloseFileImport,
  CloseLocationHoursDialog,
  CloseSemesterDialog,
  CloseSnackbar,
  CloseVirtualWeeksDialog,
  Error,
  OpenBackups,
  OpenAllotmentSummaryDialog,
  OpenAllotmentDialog,
  OpenLocationHoursDialog,
  OpenDetail,
  OpenDetailWithResourceInstance,
  OpenScheduler,
  OpenSemesterDialog,
  OpenVirtualWeeksDialog,
  OpenedFile,
  ReceivedAllResources,
  ReceivedResource,
  ReceivedResourcesAfterAllotmentUpdate,
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
  allotmentDialogIsOpen: boolean;
  allotmentSummaryDialogIsOpen: boolean;
  appIsBroken: boolean;
  backupsIsOpen: boolean;
  detailIsOpen: boolean;
  drawerIsOpen: boolean;
  error?: Error;
  fileImportIsOpen: boolean;
  loading: boolean;
  locationHoursDialogIsOpen: boolean;
  calendarEventClickState?: CalendarEventClickState;
  calendarSelectionState?: CalendarSelectionState;
  recordPage: number;
  ref: React.RefObject<FullCalendar> | null;
  schedulerIsOpen: boolean;
  schedulerLocationId?: number;
  semesterDialogIsOpen: boolean;
  snackbarQueue: SnackbarState[];
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

export type ValueDictionary = {
  [k: string]: boolean;
};

export interface FormValues {
  [k: string]: unknown;
}

export interface FormTemplateProps {
  values: FormValues;
  state: AdminState;
}

export interface CalendarSelectionState {
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
