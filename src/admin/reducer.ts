import { Action, AdminState, AdminAction } from "./types";
import { ResourceKey } from "../resources/types";
import { enqueue, dequeue } from "../utils/queue";

type StateHandler = (state: AdminState, action: Action) => AdminState;

//--------- ERROR HANDLING ---------------

/**
 * if error should be displayed to the user, add it to the snackbarQueue
 */
const errorHandler: StateHandler = (state, { payload, meta }) => {
  if (!payload || !payload.error) {
    return {
      ...state,
      snackbarQueue: enqueue(state.snackbarQueue, {
        type: "failure",
        message: "Something went wrong.",
        autoHideDuration: null,
      }),
    };
  }
  switch (meta) {
    default: {
      console.error({
        error: payload?.error,
        snackbarQueue: state.snackbarQueue,
        meta,
      });
      return {
        ...state,
        snackbarQueue: enqueue(state.snackbarQueue, {
          type: "failure",
          message: payload?.error?.message,
          autoHideDuration: null,
        }),
      };
    }
  }
};

/**
 * StateHandler functions can call this to switch control
 * to the error handler.
 */
const errorRedirect = (
  state: AdminState,
  action: Action,
  error: Error,
  meta?: unknown
): AdminState =>
  errorHandler(state, {
    ...action,
    meta: meta || action.meta,
    type: AdminAction.Error,
    payload: {
      ...action.payload,
      error,
    },
  });

//--------- NORMAL ACTION HANDLERS ----------

const closeBackups: StateHandler = (state) => ({
  ...state,
  backupsIsOpen: false,
});

const closeDetail: StateHandler = (state) => ({
  ...state,
  detailIsOpen: false,
  resourceInstance: undefined,
});

const closeFileImport: StateHandler = (state) => ({
  ...state,
  fileImportIsOpen: false,
});

const closeSnackbar: StateHandler = (state) => {
  const [snackbarQueue] = dequeue(state.snackbarQueue);
  return { ...state, snackbarQueue };
};

const openBackups: StateHandler = (state) => ({
  ...state,
  backupsIsOpen: true,
});

const openDetail: StateHandler = (state) => ({
  ...state,
  detailIsOpen: true,
});

const openScheduler: StateHandler = (state) => ({
  ...state,
  schedulerIsOpen: true,
});

const openedFile: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.resourceFile) {
    return errorRedirect(state, action, new Error("unable to open file"));
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

const receivedResource: StateHandler = (state, action) => {
  const { payload, meta } = action;
  const resources = payload?.resources;
  if (!resources) {
    return errorRedirect(state, action, new Error("no resources in payload"));
  }
  const resourceKey = meta as ResourceKey;
  if (resourceKey === undefined) {
    return errorRedirect(state, action, new Error("no context given"));
  }
  return {
    ...state,
    detailIsOpen: !!payload?.resourceInstance,
    resourceInstance: payload?.resourceInstance,
    resources: { ...state.resources, [resourceKey]: resources[resourceKey] },
  };
};

const selectedDocument: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.resourceInstance) {
    return errorRedirect(state, action, new Error("no document received"));
  }
  return {
    ...state,
    detailIsOpen: true,
    resourceInstance: payload.resourceInstance,
  };
};

const selectedRecordPage: StateHandler = (state, action) => {
  const { payload } = action;
  const recordPage = payload?.recordPage;
  if (recordPage === undefined) {
    return errorRedirect(state, action, new Error("no page number received"));
  }
  return {
    ...state,
    recordPage,
  };
};

const selectedResource: StateHandler = (state, action) => {
  const { payload } = action;
  const resourceKey = payload?.resourceKey;
  if (resourceKey === undefined) {
    return errorRedirect(state, action, new Error("no resource received"));
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

const submittingDocumentEnd: StateHandler = (state) => ({
  ...state,
  snackbarIsOpen: true,
  snackbarQueue: enqueue(state.snackbarQueue, {
    type: "success",
    message: "Changes saved",
    autoHideDuration: 6000,
  }),
});

const toggleDrawer: StateHandler = (state) => ({
  ...state,
  drawerIsOpen: !state.drawerIsOpen,
});

const reducer: StateHandler = (state, action) =>
  ({
    [AdminAction.CloseBackups]: closeBackups,
    [AdminAction.CloseDetail]: closeDetail,
    [AdminAction.CloseFileImport]: closeFileImport,
    [AdminAction.CloseSnackbar]: closeSnackbar,
    [AdminAction.Error]: errorHandler,
    [AdminAction.OpenBackups]: openBackups,
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
