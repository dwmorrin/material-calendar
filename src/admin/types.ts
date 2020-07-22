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
  CloseBackups,
  CloseDetail,
  CloseFileImport,
  CloseLocationHoursDialog,
  CloseSemesterDialog,
  CloseSnackbar,
  Error,
  OpenBackups,
  OpenLocationHoursDialog,
  OpenDetail,
  OpenScheduler,
  OpenSemesterDialog,
  OpenedFile,
  ReceivedAllResources,
  ReceivedResource,
  SelectedDocument,
  SelectedRecordPage,
  SelectedResource,
  SelectedSchedulerLocation,
  SelectedSemester,
  SubmittingDocument,
  SubmittingDocumentEnd,
  ToggleDrawer,
}

export interface AdminState {
  // UI state
  appIsBroken: boolean;
  backupsIsOpen: boolean;
  detailIsOpen: boolean;
  drawerIsOpen: boolean;
  error?: Error;
  fileImportIsOpen: boolean;
  locationHoursDialogIsOpen: boolean;
  locationHoursState?: LocationHoursState;
  recordPage: number;
  ref: React.RefObject<FullCalendar> | null;
  schedulerIsOpen: boolean;
  schedulerLocationId?: number;
  semesterDialogIsOpen: boolean;
  snackbarQueue: SnackbarState[];

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
  __options__?: FormValues;
}

export interface LocationHoursState {
  select: { start: Date; end: Date };
  time: { start: string; end: string };
  location: Location;
}
