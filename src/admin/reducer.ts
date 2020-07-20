import { Action, AdminState, AdminAction } from "./types";
import { ResourceKey } from "../resources/types";
import { enqueue, dequeue } from "../utils/queue";

type StateHandler = (state: AdminState, action: Action) => AdminState;

//--------- ERROR HANDLING ---------------

/**
 * if error should be displayed to the user, add it to the snackbarQueue
 */
const errorHandler: StateHandler = (state, { payload, meta }) => {
  const defaultErrorMessage = "Something went wrong.";
  if (!payload || !payload.error) {
    return {
      ...state,
      snackbarQueue: enqueue(state.snackbarQueue, {
        type: "failure",
        message: defaultErrorMessage,
        autoHideDuration: null,
      }),
    };
  }
  switch (meta) {
    case "FILE_PICKER":
      return {
        ...state,
        snackbarQueue: enqueue(state.snackbarQueue, {
          type: "failure",
          message: "Unable to open file!",
          autoHideDuration: 6000,
        }),
      };
    case "FETCH_ALL_RESOURCES_REJECTED":
      return {
        ...state,
        appIsBroken: true,
        error: payload?.error,
        snackbarQueue: enqueue(state.snackbarQueue, {
          type: "failure",
          message:
            "Sorry, something is wrong in the server! Contact tech support",
          autoHideDuration: null,
        }),
      };
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
          message: payload?.error?.message || defaultErrorMessage,
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

const closeLocationHoursDialog: StateHandler = (state) => ({
  ...state,
  locationHoursDialogIsOpen: false,
});

const closeSnackbar: StateHandler = (state) => {
  const [snackbarQueue] = dequeue(state.snackbarQueue);
  return { ...state, snackbarQueue };
};

const closeSemesterDialog: StateHandler = (state) => ({
  ...state,
  semesterDialogIsOpen: false,
});

const openBackups: StateHandler = (state) => ({
  ...state,
  backupsIsOpen: true,
});

const openDetail: StateHandler = (state) => ({
  ...state,
  detailIsOpen: true,
});

const openLocationHoursDialog: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
  locationHoursDialogIsOpen: true,
});

const openScheduler: StateHandler = (state) => ({
  ...state,
  schedulerIsOpen: true,
});

const openSemesterDialog: StateHandler = (state) => ({
  ...state,
  semesterDialogIsOpen: true,
});

const openedFile: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
  fileImportIsOpen: true,
});

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
    snackbarIsOpen: true,
    snackbarQueue: enqueue(state.snackbarQueue, {
      type: "success",
      message: "Changes saved",
      autoHideDuration: 6000,
    }),
  };
};

const selectedDocument: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
  detailIsOpen: true,
});

const selectedRecordPage: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
});

const selectedResource: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
  schedulerIsOpen: false,
  recordPage: 0,
});

const selectedSchedulerLocation: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
  schedulerIsOpen: true,
});

const selectedSemester: StateHandler = (state, action) => {
  if (!state.ref?.current) {
    return errorRedirect(state, action, new Error("no ref to calendar"));
  }
  if (!action.payload?.selectedSemester?.start) {
    return errorRedirect(
      state,
      action,
      new Error("null or invalid semester selected")
    );
  }
  state.ref.current.getApi().gotoDate(action.payload.selectedSemester.start);
  return {
    ...state,
    ...action.payload,
    semesterDialogIsOpen: false,
  };
};

const submittingDocument: StateHandler = (state) => state;

const submittingDocumentEnd: StateHandler = (state) => state;

const toggleDrawer: StateHandler = (state) => ({
  ...state,
  drawerIsOpen: !state.drawerIsOpen,
});

const reducer: StateHandler = (state, action) =>
  ({
    [AdminAction.CloseBackups]: closeBackups,
    [AdminAction.CloseDetail]: closeDetail,
    [AdminAction.CloseFileImport]: closeFileImport,
    [AdminAction.CloseLocationHoursDialog]: closeLocationHoursDialog,
    [AdminAction.CloseSemesterDialog]: closeSemesterDialog,
    [AdminAction.CloseSnackbar]: closeSnackbar,
    [AdminAction.Error]: errorHandler,
    [AdminAction.OpenBackups]: openBackups,
    [AdminAction.OpenDetail]: openDetail,
    [AdminAction.OpenLocationHoursDialog]: openLocationHoursDialog,
    [AdminAction.OpenScheduler]: openScheduler,
    [AdminAction.OpenSemesterDialog]: openSemesterDialog,
    [AdminAction.OpenedFile]: openedFile,
    [AdminAction.ReceivedAllResources]: receivedAllResources,
    [AdminAction.ReceivedResource]: receivedResource,
    [AdminAction.SelectedDocument]: selectedDocument,
    [AdminAction.SelectedRecordPage]: selectedRecordPage,
    [AdminAction.SelectedResource]: selectedResource,
    [AdminAction.SelectedSchedulerLocation]: selectedSchedulerLocation,
    [AdminAction.SelectedSemester]: selectedSemester,
    [AdminAction.SubmittingDocument]: submittingDocument,
    [AdminAction.SubmittingDocumentEnd]: submittingDocumentEnd,
    [AdminAction.ToggleDrawer]: toggleDrawer,
  }[action.type](state, action));

export default reducer;
