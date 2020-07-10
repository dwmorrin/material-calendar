import { CalendarAction, CalendarState, Action } from "./types";
import { ResourceKey } from "../resources/types";
import UserGroup from "../resources/UserGroup";

type StateHandler = (state: CalendarState, action: Action) => CalendarState;

const changedView: StateHandler = (state, { payload }) => {
  if (!state.ref?.current || !payload?.currentView) {
    console.error("no calendar ref or no view received in view change request");
    return state;
  }
  state.ref.current.getApi().changeView(payload.currentView);
  return { ...state, currentView: payload.currentView };
};

const closeReservationForm: StateHandler = (state) => ({
  ...state,
  reservationFormIsOpen: false,
});

const closeProjectForm: StateHandler = (state) => ({
  ...state,
  projectFormIsOpen: false,
});

const closeEquipmentForm: StateHandler = (state) => ({
  ...state,
  equipmentFormIsOpen: false,
});

const closeEventDetail: StateHandler = (state) => ({
  ...state,
  detailIsOpen: false,
});

const closeEventEditor: StateHandler = (state) => ({
  ...state,
  eventEditorIsOpen: false,
});

const closeProjectDashboard: StateHandler = (state) => ({
  ...state,
  projectDashboardIsOpen: false,
  currentProject: undefined,
});

const closeGroupDashboard: StateHandler = (state) => ({
  ...state,
  groupDashboardIsOpen: false,
});

const error: StateHandler = (state, { payload, meta }) => {
  if (payload && payload.error) {
    console.error({ error: payload.error, meta });
  }
  return state;
};

const loading: StateHandler = (state) => ({
  ...state,
  loading: true,
});

const pickedDate: StateHandler = (state, { payload }) => {
  if (!payload?.currentStart) {
    console.error("no date returned from picker");
    return state;
  }
  const currentStart = payload.currentStart;
  if (state.ref?.current) {
    state.ref.current.getApi().gotoDate(currentStart);
  }
  return { ...state, currentStart, pickerShowing: !state.pickerShowing };
};

const openEventDetail: StateHandler = (state, { payload }) => {
  if (!payload?.currentEvent) {
    console.error("no event received for detail view");
    return state;
  }
  return {
    ...state,
    detailIsOpen: true,
    currentEvent: payload.currentEvent,
  };
};

const openEventEditor: StateHandler = (state, { payload }) => {
  if (!payload?.currentEvent) {
    console.error("no event received for event editor");
    return state;
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

const openProjectDashboard: StateHandler = (state, { payload }) => {
  if (!payload || !payload.currentProject) {
    console.error("no current project found; cannot open project");
    return state;
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
  loading: false,
});

const receivedResource: StateHandler = (state, { payload, meta }) => {
  const resources = payload?.resources;
  if (!resources) {
    throw new Error("no resources in payload");
  }
  const resourceKey = meta as number;
  if (resourceKey === undefined) {
    throw new Error("no context given");
  }
  return {
    ...state,
    resources: {
      ...state.resources,
      [resourceKey]: resources[resourceKey],
    },
  };
};

const selectedGroup: StateHandler = (state, { payload }) => {
  if (!payload?.currentGroup) {
    console.error("no group in selected group");
    return state;
  }
  return { ...state, currentGroup: payload.currentGroup };
};

const selectedLocation: StateHandler = (state, { payload }) => {
  if (!payload?.resources || !payload.resources[ResourceKey.Locations]) {
    console.error("no locations in selected location");
    return state;
  }
  sessionStorage.setItem(
    "locations",
    JSON.stringify(!payload.resources[ResourceKey.Locations])
  );
  return {
    ...state,
    resources: {
      ...state.resources,
      [ResourceKey.Locations]: payload.resources[ResourceKey.Locations],
    },
  };
};

const selectedProject: StateHandler = (state, { payload }) => {
  if (!payload?.resources || !payload.resources[ResourceKey.Projects]) {
    console.error("no user projects in selected projects");
    return state;
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

const viewToday: StateHandler = (state) => {
  if (!state.ref?.current) {
    console.error("no calendar reference");
    return state;
  }
  state.ref.current.getApi().today();
  return { ...state, currentStart: new Date() };
};

const calendarReducer: StateHandler = (state, action) =>
  ({
    [CalendarAction.ChangedView]: changedView,
    [CalendarAction.CloseProjectForm]: closeProjectForm,
    [CalendarAction.CloseReservationForm]: closeReservationForm,
    [CalendarAction.CloseEquipmentForm]: closeEquipmentForm,
    [CalendarAction.CloseEventDetail]: closeEventDetail,
    [CalendarAction.CloseEventEditor]: closeEventEditor,
    [CalendarAction.CloseProjectDashboard]: closeProjectDashboard,
    [CalendarAction.CloseGroupDashboard]: closeGroupDashboard,
    [CalendarAction.Error]: error,
    [CalendarAction.Loading]: loading,
    [CalendarAction.PickedDate]: pickedDate,
    [CalendarAction.OpenReservationForm]: openReservationForm,
    [CalendarAction.OpenProjectForm]: openProjectForm,
    [CalendarAction.OpenEventDetail]: openEventDetail,
    [CalendarAction.OpenEventEditor]: openEventEditor,
    [CalendarAction.OpenGroupDashboard]: openGroupDashboard,
    [CalendarAction.OpenProjectDashboard]: openProjectDashboard,
    [CalendarAction.ReceivedAllResources]: receivedAllResources,
    [CalendarAction.ReceivedResource]: receivedResource,
    [CalendarAction.SelectedGroup]: selectedGroup,
    [CalendarAction.SelectedLocation]: selectedLocation,
    [CalendarAction.SelectedProject]: selectedProject,
    [CalendarAction.ToggleDrawer]: toggleDrawer,
    [CalendarAction.TogglePicker]: togglePicker,
    [CalendarAction.ViewToday]: viewToday,
  }[action.type](state, action));

export default calendarReducer;
