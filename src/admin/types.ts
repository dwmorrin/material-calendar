import { ResourceKey, ResourceInstance } from "../resources/types";

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
  Error,
  OpenBackups,
  OpenDetail,
  OpenScheduler,
  OpenedFile,
  ReceivedAllResources,
  ReceivedResource,
  SelectedDocument,
  SelectedRecordPage,
  SelectedResource,
  SelectedSchedulerLocation,
  SubmittingDocument,
  SubmittingDocumentEnd,
  ToggleDrawer,
}

export interface AdminState {
  // UI state
  backupsIsOpen: boolean;
  detailIsOpen: boolean;
  drawerIsOpen: boolean;
  error?: {};
  fileImportIsOpen: boolean;
  recordPage: number;
  schedulerIsOpen: boolean;
  schedulerLocationId?: number;

  // resources
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
