import { CalendarAction, CalendarState, Action } from "./types";
import { ResourceKey } from "../resources/types";
import UserGroup from "../resources/UserGroup";
import { enqueue, dequeue } from "../utils/queue";
import { ErrorType } from "../utils/error";
import Event from "../resources/Event";

type StateHandler = (state: CalendarState, action: Action) => CalendarState;

//-------- ERROR HANDLING ---------------

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
    case ErrorType.IMPOSSIBLE_STATE:
      return {
        ...state,
        appIsBroken: true,
        error: payload.error,
        snackbarQueue: enqueue(state.snackbarQueue, {
          type: "failure",
          message: `We've encounted a strange bug! The app says: ${payload.error.message}`,
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

const displayMessage: StateHandler = (state, { payload }) => {
  if (!payload || !payload.message) {
    return state;
  }
  return {
    ...state,
    snackbarQueue: enqueue(state.snackbarQueue, {
      type: "success",
      message: payload.message || "",
      autoHideDuration: null,
    }),
  };
};

/**
 * StateHandler functions can call this to switch control
 * to the error handler.
 */
const errorRedirect = (
  state: CalendarState,
  action: Action,
  message: string,
  meta?: unknown
): CalendarState =>
  errorHandler(state, {
    ...action,
    meta: meta || action.meta,
    type: CalendarAction.Error,
    payload: {
      ...action.payload,
      error: new Error(message),
    },
  });

function receivedResource(state: CalendarState, action: Action): CalendarState {
  const { payload, meta } = action;
  const resources = payload?.resources;
  if (!resources) {
    return errorRedirect(
      state,
      action,
      "no resources in payload",
      ErrorType.MISSING_RESOURCE
    );
  }
  const resourceKey = meta as number;
  if (resourceKey === undefined) {
    return errorRedirect(
      state,
      action,
      "no context given",
      ErrorType.MISSING_RESOURCE
    );
  }
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceKey]: resources[resourceKey],
    },
  };
}

//--------- NORMAL ACTION HANDLERS ----------

const canceledReservation: StateHandler = (state) => {
  return displayMessage(
    { ...state, detailIsOpen: false },
    {
      type: CalendarAction.DisplayMessage,
      payload: {
        message: "Your Reservation has been Canceled",
      },
    }
  );
};

const closeEquipmentForm: StateHandler = (state) => ({
  ...state,
  equipmentFormIsOpen: false,
});

const closeEventDetail: StateHandler = (state) => ({
  ...state,
  detailIsOpen: false,
});

function closeEventEditor(state: CalendarState): CalendarState {
  return {
    ...state,
    eventEditorIsOpen: false,
  };
}

const closeGroupDashboard: StateHandler = (state) => ({
  ...state,
  groupDashboardIsOpen: false,
});

const closeProjectDashboard: StateHandler = (state) => ({
  ...state,
  projectDashboardIsOpen: false,
  currentProject: undefined,
  currentGroup: undefined,
});

const closeProjectForm: StateHandler = (state) => ({
  ...state,
  projectFormIsOpen: false,
});

const closeReservationForm: StateHandler = (state) => ({
  ...state,
  reservationFormIsOpen: false,
});

const closeSnackbar: StateHandler = (state) => {
  const [snackbarQueue] = dequeue(state.snackbarQueue);
  return { ...state, snackbarQueue };
};

const createdEventsReceived: StateHandler = (state, action) => {
  return closeEventEditor(receivedResource(state, action));
};

const joinedGroup: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentGroup) {
    return errorRedirect(
      state,
      action,
      "no group joined",
      ErrorType.MISSING_RESOURCE
    );
  }
  return displayMessage(
    // This should probably not close the groupDashboard
    { ...state, currentGroup: payload.currentGroup },
    {
      type: CalendarAction.DisplayMessage,
      payload: {
        message: "You have joined the group",
      },
    }
  );
};

const leftGroup: StateHandler = (state) => {
  return displayMessage(
    // This should probably not close the groupDashboard
    { ...state, currentGroup: undefined },
    {
      type: CalendarAction.DisplayMessage,
      payload: {
        message: "You have left the group",
      },
    }
  );
};

const pickedDate: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentStart) {
    return errorRedirect(
      state,
      action,
      "no date returned from picker",
      ErrorType.MISSING_RESOURCE
    );
  }
  const currentStart = payload.currentStart;
  if (state.ref?.current) {
    state.ref.current.getApi().gotoDate(currentStart);
  }
  return { ...state, currentStart, pickerShowing: !state.pickerShowing };
};

const openEventDetail: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentEvent) {
    return errorRedirect(
      state,
      action,
      "no event received for detail view",
      ErrorType.MISSING_RESOURCE
    );
  }
  return {
    ...state,
    detailIsOpen: true,
    currentEvent: payload.currentEvent,
  };
};

const openEventEditor: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentEvent) {
    return errorRedirect(
      state,
      action,
      "no event received for event editor",
      ErrorType.MISSING_RESOURCE
    );
  }
  return {
    ...state,
    eventEditorIsOpen: true,
    currentEvent: payload.currentEvent,
  };
};

const openGroupDashboard: StateHandler = (state) => ({
  ...state,
  // currentProject: payload?.currentProject,
  groupDashboardIsOpen: true,
});

const openProjectDashboard: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload || !payload.currentProject) {
    return errorRedirect(
      state,
      action,
      "no current project found; cannot open project",
      ErrorType.MISSING_RESOURCE
    );
  }
  const { currentGroup, resources } = state;
  const { currentProject } = payload;
  const groups = resources[ResourceKey.Groups] as UserGroup[];
  const group =
    currentGroup ||
    groups.find((group) => group.projectId === currentProject.id);
  return {
    ...state,
    currentGroup: group,
    currentProject: currentProject,
    projectDashboardIsOpen: true,
  };
};

const openProjectForm: StateHandler = (state, { payload }) => {
  return {
    ...state,
    currentCourse: payload?.currentCourse,
    projectFormIsOpen: true,
  };
};

const openReservationForm: StateHandler = (state) => ({
  ...state,
  reservationFormIsOpen: true,
});

const receivedAllResources: StateHandler = (state, { payload }) => ({
  ...state,
  resources: { ...state.resources, ...payload?.resources },
  initialResourcesPending: false,
});

const selectedEvent: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentEvent) {
    return errorRedirect(
      state,
      action,
      "no event received for selecting Event",
      ErrorType.MISSING_RESOURCE
    );
  }
  return {
    ...state,
    currentEvent: payload.currentEvent,
  };
};

const selectedGroup: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentGroup) {
    return errorRedirect(
      state,
      action,
      "no group in selected group",
      ErrorType.MISSING_RESOURCE
    );
  }
  return { ...state, currentGroup: payload.currentGroup };
};

const selectedLocation: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.resources || !payload.resources[ResourceKey.Locations]) {
    return errorRedirect(
      state,
      action,
      "no locations in selected location",
      ErrorType.MISSING_RESOURCE
    );
  }
  return {
    ...state,
    resources: {
      ...state.resources,
      [ResourceKey.Locations]: payload.resources[ResourceKey.Locations],
    },
  };
};

const selectedProject: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.resources || !payload.resources[ResourceKey.Projects]) {
    return errorRedirect(
      state,
      action,
      "no user projects in selected projects",
      ErrorType.MISSING_RESOURCE
    );
  }
  return {
    ...state,
    resources: {
      ...state.resources,
      [ResourceKey.Projects]: payload.resources[ResourceKey.Projects],
    },
  };
};

const toggleDrawer: StateHandler = (state) => ({
  ...state,
  drawerIsOpen: !state.drawerIsOpen,
});

const togglePicker: StateHandler = (state) => ({
  ...state,
  pickerShowing: !state.pickerShowing,
});

const updateEvents: StateHandler = (state, action) => {
  const { payload, meta } = action;
  const resources = payload?.resources;
  if (!resources) {
    return errorRedirect(
      state,
      action,
      "no resources in payload",
      ErrorType.MISSING_RESOURCE
    );
  }
  const resourceKey = meta as number;
  if (resourceKey === undefined) {
    return errorRedirect(
      state,
      action,
      "no context given",
      ErrorType.MISSING_RESOURCE
    );
  }
  const updatedCurrentEvent = resources[resourceKey].find(
    (event) => event.id == state.currentEvent?.id
  ) as Event;
  return {
    ...state,
    currentEvent: updatedCurrentEvent,
    resources: {
      ...state.resources,
      [resourceKey]: resources[resourceKey],
    },
  };
};

const UpdatedEventReceived: StateHandler = (state, action) =>
  closeEventEditor(
    selectedEvent(
      {
        ...receivedResource(state, action),
        currentEvent: action.payload?.currentEvent,
      },
      action
    )
  );

const viewToday: StateHandler = (state, action) => {
  if (!state.ref?.current) {
    return errorRedirect(
      state,
      action,
      "no calendar reference",
      ErrorType.IMPOSSIBLE_STATE
    );
  }
  state.ref.current.getApi().today();
  return { ...state, currentStart: new Date() };
};

const calendarReducer: StateHandler = (state, action) =>
  ({
    [CalendarAction.CanceledReservation]: canceledReservation,
    [CalendarAction.CloseEquipmentForm]: closeEquipmentForm,
    [CalendarAction.CloseEventDetail]: closeEventDetail,
    [CalendarAction.CloseEventEditor]: closeEventEditor,
    [CalendarAction.CloseGroupDashboard]: closeGroupDashboard,
    [CalendarAction.CloseProjectDashboard]: closeProjectDashboard,
    [CalendarAction.CloseProjectForm]: closeProjectForm,
    [CalendarAction.CloseReservationForm]: closeReservationForm,
    [CalendarAction.CloseSnackbar]: closeSnackbar,
    [CalendarAction.CreatedEventsReceived]: createdEventsReceived,
    [CalendarAction.DisplayMessage]: displayMessage,
    [CalendarAction.Error]: errorHandler,
    [CalendarAction.JoinedGroup]: joinedGroup,
    [CalendarAction.LeftGroup]: leftGroup,
    [CalendarAction.OpenEventDetail]: openEventDetail,
    [CalendarAction.OpenEventEditor]: openEventEditor,
    [CalendarAction.OpenGroupDashboard]: openGroupDashboard,
    [CalendarAction.OpenProjectDashboard]: openProjectDashboard,
    [CalendarAction.OpenProjectForm]: openProjectForm,
    [CalendarAction.OpenReservationForm]: openReservationForm,
    [CalendarAction.PickedDate]: pickedDate,
    [CalendarAction.ReceivedAllResources]: receivedAllResources,
    [CalendarAction.ReceivedResource]: receivedResource,
    [CalendarAction.SelectedEvent]: selectedEvent,
    [CalendarAction.SelectedGroup]: selectedGroup,
    [CalendarAction.SelectedLocation]: selectedLocation,
    [CalendarAction.SelectedProject]: selectedProject,
    [CalendarAction.ToggleDrawer]: toggleDrawer,
    [CalendarAction.TogglePicker]: togglePicker,
    [CalendarAction.UpdateEvents]: updateEvents,
    [CalendarAction.UpdatedEventReceived]: UpdatedEventReceived,
    [CalendarAction.ViewToday]: viewToday,
  }[action.type](state, action));

export default calendarReducer;
