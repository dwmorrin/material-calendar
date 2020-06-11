import { Action, AdminState, AdminAction } from "./types";
import { ResourceKey } from "../resources/types";

type StateHandler = (state: AdminState, action: Action) => AdminState;

const closeDetail: StateHandler = (state) => ({
  ...state,
  detailIsOpen: false,
  resourceInstance: undefined,
});

const closeFileImport: StateHandler = (state) => ({
  ...state,
  fileImportIsOpen: false,
});

const error: StateHandler = (state, { payload, meta }) => {
  if (payload && payload.error) {
    console.error({ error: payload.error, meta });
  }
  return state;
};

const openDetail: StateHandler = (state) => ({
  ...state,
  detailIsOpen: true,
});

const openScheduler: StateHandler = (state) => ({
  ...state,
  schedulerIsOpen: true,
});

const openedFile: StateHandler = (state, { payload }) => {
  if (!payload?.resourceFile) {
    throw new Error("unable to open file");
  }
  return {
    ...state,
    fileImportIsOpen: true,
    resourceFile: payload.resourceFile,
  };
};

const receivedAllResources: StateHandler = (state, { payload }) => ({
  ...state,
  resources: { ...state.resources, ...payload?.resources },
  loading: false,
});

const receivedResource: StateHandler = (state, { payload, meta }) => {
  const resources = payload?.resources;
  if (!resources) {
    throw new Error("no resources in payload");
  }
  const resourceKey = meta as ResourceKey;
  if (resourceKey === undefined) {
    throw new Error("no context given");
  }
  return {
    ...state,
    detailIsOpen: !!payload?.resourceInstance,
    resourceInstance: payload?.resourceInstance,
    resources: { ...state.resources, [resourceKey]: resources[resourceKey] },
  };
};

const selectedDocument: StateHandler = (state, { payload }) => {
  if (!payload?.resourceInstance) {
    throw new Error("no document received");
  }
  return {
    ...state,
    detailIsOpen: true,
    resourceInstance: payload.resourceInstance,
  };
};

const selectedRecordPage: StateHandler = (state, { payload }) => {
  const recordPage = payload?.recordPage;
  if (recordPage === undefined) {
    throw new Error("no page number received");
  }
  return {
    ...state,
    recordPage,
  };
};

const selectedResource: StateHandler = (state, { payload }) => {
  const resourceKey = payload?.resourceKey;
  if (resourceKey === undefined) {
    throw new Error("no resource received");
  }
  return {
    ...state,
    schedulerIsOpen: false,
    resourceKey,
    recordPage: 0,
  };
};

const selectedSchedulerLocation: StateHandler = (state, { payload }) => ({
  ...state,
  schedulerIsOpen: true,
  schedulerLocationId: payload?.schedulerLocationId,
});

const submittingDocument: StateHandler = (state) => state;

const submittingDocumentEnd: StateHandler = (state) => state;

const toggleDrawer: StateHandler = (state) => ({
  ...state,
  drawerIsOpen: !state.drawerIsOpen,
});

const reducer: StateHandler = (state, action) =>
  ({
    [AdminAction.CloseDetail]: closeDetail,
    [AdminAction.CloseFileImport]: closeFileImport,
    [AdminAction.Error]: error,
    [AdminAction.OpenDetail]: openDetail,
    [AdminAction.OpenScheduler]: openScheduler,
    [AdminAction.OpenedFile]: openedFile,
    [AdminAction.ReceivedAllResources]: receivedAllResources,
    [AdminAction.ReceivedResource]: receivedResource,
    [AdminAction.SelectedDocument]: selectedDocument,
    [AdminAction.SelectedRecordPage]: selectedRecordPage,
    [AdminAction.SelectedResource]: selectedResource,
    [AdminAction.SelectedSchedulerLocation]: selectedSchedulerLocation,
    [AdminAction.SubmittingDocument]: submittingDocument,
    [AdminAction.SubmittingDocumentEnd]: submittingDocumentEnd,
    [AdminAction.ToggleDrawer]: toggleDrawer,
  }[action.type](state, action));

export default reducer;
