import { Action, AdminState, AdminAction } from "./types";
import { ResourceKey } from "../resources/types";
import { enqueue, dequeue } from "../utils/queue";
import { ErrorType } from "../utils/error";

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
  switch (meta as ErrorType) {
    case ErrorType.FILE_PICKER:
      return {
        ...state,
        snackbarQueue: enqueue(state.snackbarQueue, {
          type: "failure",
          message: "Unable to open file!",
          autoHideDuration: 6000,
        }),
      };
    case ErrorType.MISSING_RESOURCE:
      return {
        ...state,
        appIsBroken: true,
        error: payload.error,
        snackbarQueue: enqueue(state.snackbarQueue, {
          type: "failure",
          message:
            payload.error.message ||
            "We didn't receive all the data from the server, try again later",
          autoHideDuration: null,
        }),
      };
    default: {
      console.error({
        error: payload.error,
        snackbarQueue: state.snackbarQueue,
        meta,
      });
      return {
        ...state,
        snackbarQueue: enqueue(state.snackbarQueue, {
          type: "failure",
          message: payload.error.message || defaultErrorMessage,
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

const addProjectToLocationSuccess: StateHandler = (state, { payload }) => {
  return {
    ...state,
    ...payload,
    addProjectToLocationIsOpen: false,
    snackbarIsOpen: true,
    snackbarQueue: enqueue(state.snackbarQueue, {
      type: "success",
      message: "Projects added to location",
      autoHideDuration: 6000,
    }),
  };
};

const closeAddProjectToLocation: StateHandler = (state) => ({
  ...state,
  addProjectToLocationIsOpen: false,
});

const closeProjectLocationHoursDialog: StateHandler = (state) => ({
  ...state,
  projectLocationHoursDialogIsOpen: false,
});

const closeProjectLocationHoursSummaryDialog: StateHandler = (state) => ({
  ...state,
  projectLocationHoursSummaryDialogIsOpen: false,
});

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
  resourceFile: null,
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

const closeVirtualWeeksDialog: StateHandler = (state) => ({
  ...state,
  virtualWeeksDialogIsOpen: false,
});

const closeVirtualWeekSplitDialog: StateHandler = (state) => ({
  ...state,
  virtualWeekModifyDialogIsOpen: false,
});

const fileImportSuccess: StateHandler = (state, { payload }) => ({
  ...state,
  fileImportIsOpen: false,
  resources: { ...state.resources, ...payload?.resources },
  snackbarIsOpen: true,
  snackbarQueue: enqueue(state.snackbarQueue, {
    type: "success",
    message: "File imported",
    autoHideDuration: 6000,
  }),
});

const openAddProjectToLocation: StateHandler = (state) => ({
  ...state,
  addProjectToLocationIsOpen: true,
});

const openProjectLocationHoursDialog: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
  projectLocationHoursDialogIsOpen: true,
});

const openProjectLocationHoursSummaryDialog: StateHandler = (
  state,
  { payload }
) => ({
  ...state,
  ...payload,
  projectLocationHoursSummaryDialogIsOpen: true,
});

const openBackups: StateHandler = (state) => ({
  ...state,
  backupsIsOpen: true,
});

const openDetail: StateHandler = (state) => ({
  ...state,
  detailIsOpen: true,
});

const openDetailWithResourceInstance: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
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

const openVirtualWeekSplitDialog: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
  virtualWeekModifyDialogIsOpen: true,
});

const openedFile: StateHandler = (state, { payload }) => ({
  ...state,
  ...payload,
  fileImportIsOpen: true,
});

const receivedAllResources: StateHandler = (state, { payload }) => ({
  ...state,
  resources: { ...state.resources, ...payload?.resources },
  initialResourcesPending: false,
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
    detailIsOpen: false,
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

const receivedResourcesAfterProjectLocationHoursUpdate: StateHandler = (
  state,
  { payload }
) => ({
  ...state,
  resources: { ...state.resources, ...payload?.resources },
  snackbarIsOpen: true,
  snackbarQueue: enqueue(state.snackbarQueue, {
    type: "success",
    message: "Allotments updated",
    autoHideDuration: 6000,
  }),
});

const receivedResourcesAfterLocationHoursUpdate: StateHandler = (
  state,
  { payload }
) => ({
  ...state,
  resources: { ...state.resources, ...payload?.resources },
  snackbarIsOpen: true,
  snackbarQueue: enqueue(state.snackbarQueue, {
    type: "success",
    message: "Location hours updated",
    autoHideDuration: 6000,
  }),
});

const receivedResourcesAfterLocationImport: StateHandler = (
  state,
  { payload }
) => ({
  ...state,
  resources: { ...state.resources, ...payload?.resources },
  snackbarIsOpen: true,
  snackbarQueue: enqueue(state.snackbarQueue, {
    type: "success",
    message: "Locations imported",
    autoHideDuration: 6000,
  }),
});

const receivedResourcesAfterRosterImport: StateHandler = (
  state,
  { payload }
) => ({
  ...state,
  resources: { ...state.resources, ...payload?.resources },
  snackbarIsOpen: true,
  snackbarQueue: enqueue(state.snackbarQueue, {
    type: "success",
    message: "Roster imported",
    autoHideDuration: 6000,
  }),
});

const receivedResourcesAfterVirtualWeekUpdate: StateHandler = (
  state,
  { payload }
) => ({
  ...state,
  ...payload,
  virtualWeekModifyDialogIsOpen: false,
  snackbarIsOpen: true,
  snackbarQueue: enqueue(state.snackbarQueue, {
    type: "success",
    message: "Virtual week updated",
    autoHideDuration: 6000,
  }),
});

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

const selectedSchedulerLocation: StateHandler = (state) => ({
  ...state,
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

const toggleDrawer: StateHandler = (state) => ({
  ...state,
  drawerIsOpen: !state.drawerIsOpen,
});

const reducer: StateHandler = (state, action) =>
  ({
    [AdminAction.AddProjectToLocationSuccess]: addProjectToLocationSuccess,
    [AdminAction.CloseAddProjectToLocation]: closeAddProjectToLocation,
    [AdminAction.CloseBackups]: closeBackups,
    [AdminAction.CloseDetail]: closeDetail,
    [AdminAction.CloseFileImport]: closeFileImport,
    [AdminAction.CloseLocationHoursDialog]: closeLocationHoursDialog,
    [AdminAction.CloseProjectLocationHoursDialog]:
      closeProjectLocationHoursDialog,
    [AdminAction.CloseProjectLocationHoursSummaryDialog]:
      closeProjectLocationHoursSummaryDialog,
    [AdminAction.CloseSemesterDialog]: closeSemesterDialog,
    [AdminAction.CloseSnackbar]: closeSnackbar,
    [AdminAction.CloseVirtualWeeksDialog]: closeVirtualWeeksDialog,
    [AdminAction.CloseVirtualWeekModifyDialog]: closeVirtualWeekSplitDialog,
    [AdminAction.Error]: errorHandler,
    [AdminAction.FileImportSuccess]: fileImportSuccess,
    [AdminAction.OpenAddProjectToLocation]: openAddProjectToLocation,
    [AdminAction.OpenProjectLocationHoursSummaryDialog]:
      openProjectLocationHoursSummaryDialog,
    [AdminAction.OpenBackups]: openBackups,
    [AdminAction.OpenDetail]: openDetail,
    [AdminAction.OpenDetailWithResourceInstance]:
      openDetailWithResourceInstance,
    [AdminAction.OpenLocationHoursDialog]: openLocationHoursDialog,
    [AdminAction.OpenProjectLocationHoursDialog]:
      openProjectLocationHoursDialog,
    [AdminAction.OpenScheduler]: openScheduler,
    [AdminAction.OpenSemesterDialog]: openSemesterDialog,
    [AdminAction.OpenVirtualWeekModifyDialog]: openVirtualWeekSplitDialog,
    [AdminAction.OpenedFile]: openedFile,
    [AdminAction.ReceivedAllResources]: receivedAllResources,
    [AdminAction.ReceivedResource]: receivedResource,
    [AdminAction.ReceivedResourcesAfterLocationHoursUpdate]:
      receivedResourcesAfterLocationHoursUpdate,
    [AdminAction.ReceivedResourcesAfterProjectLocationHoursUpdate]:
      receivedResourcesAfterProjectLocationHoursUpdate,
    [AdminAction.ReceivedResourcesAfterLocationImport]:
      receivedResourcesAfterLocationImport,
    [AdminAction.ReceivedResourcesAfterRosterImport]:
      receivedResourcesAfterRosterImport,
    [AdminAction.ReceivedResourcesAfterVirtualWeekUpdate]:
      receivedResourcesAfterVirtualWeekUpdate,
    [AdminAction.SelectedDocument]: selectedDocument,
    [AdminAction.SelectedRecordPage]: selectedRecordPage,
    [AdminAction.SelectedResource]: selectedResource,
    [AdminAction.SelectedSchedulerLocation]: selectedSchedulerLocation,
    [AdminAction.SelectedSemester]: selectedSemester,
    [AdminAction.SubmittingDocument]: submittingDocument,
    [AdminAction.ToggleDrawer]: toggleDrawer,
  }[action.type](state, action));

// const logger: StateHandler = (state, action) => {
//   console.log({
//     state,
//     action: AdminAction[action.type],
//     payload: action.payload,
//   });
//   return reducer(state, action);
// };

// export default logger;

export default reducer;
