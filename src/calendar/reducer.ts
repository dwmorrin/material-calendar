import { CalendarAction, CalendarState, Action } from "./types";
import { ResourceKey } from "../resources/types";

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

const closeGearForm: StateHandler = (state) => ({
  ...state,
  gearFormIsOpen: false,
});

const closeEventDetail: StateHandler = (state) => ({
  ...state,
  detailIsOpen: false,
});

const closeProjectDashboard: StateHandler = (state) => ({
  ...state,
  projectDashboardIsOpen: false,
});

const closeGroupDashboard: StateHandler = (state) => ({
  ...state,
  groupDashboardIsOpen: false,
});

const error: StateHandler = (state, { payload }) => {
  if (payload && payload.error) {
    console.error(payload.error);
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

const openReservationForm: StateHandler = (state) => ({
  ...state,
  reservationFormIsOpen: true,
});

const openGearForm: StateHandler = (state) => ({
  ...state,
  gearFormIsOpen: true,
});

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

const openGroupDashboard: StateHandler = (state) => ({
  ...state,
  // currentProject: payload?.currentProject,
  groupDashboardIsOpen: true,
});

const openProjectDashboard: StateHandler = (state, { payload }) => ({
  ...state,
  currentProject: payload?.currentProject,
  projectDashboardIsOpen: true,
});

const receivedAllResources: StateHandler = (state, { payload }) => ({
  ...state,
  resources: { ...state.resources, ...payload?.resources },
  loading: false,
});

const receivedResource: StateHandler = (
  state,
  { payload, meta: resourceKey }
) => {
  const resources = payload?.resources;
  if (!resources) {
    throw new Error("no resources in payload");
  }
  if (resourceKey === undefined) {
    throw new Error("no context given");
  }
  return {
    ...state,
    resources: { ...state.resources, [resourceKey]: resources[resourceKey] },
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
  if (
    !payload ||
    !payload.resources ||
    !payload.resources[ResourceKey.Locations]
  ) {
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
    [CalendarAction.CloseReservationForm]: closeReservationForm,
    [CalendarAction.CloseGearForm]: closeGearForm,
    [CalendarAction.CloseEventDetail]: closeEventDetail,
    [CalendarAction.CloseProjectDashboard]: closeProjectDashboard,
    [CalendarAction.CloseGroupDashboard]: closeGroupDashboard,
    [CalendarAction.Error]: error,
    [CalendarAction.Loading]: loading,
    [CalendarAction.PickedDate]: pickedDate,
    [CalendarAction.OpenReservationForm]: openReservationForm,
    [CalendarAction.OpenGearForm]: openGearForm,
    [CalendarAction.OpenEventDetail]: openEventDetail,
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
