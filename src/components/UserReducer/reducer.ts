import { CalendarAction } from "../types";
import { ResourceKey } from "../../resources/types";
import { dequeue } from "../../utils/queue";
import { StateHandler } from "./types";

import displayMessage from "./displayMessage";
import errorHandler from "./errorHandler";
import { missingResource, impossibleState } from "./errorRedirect";
import logger from "./logger";

import {
  closeEventDetail,
  closeEventEditor,
  createdEventsReceived,
  deletedOneEvent,
  eventLock,
  eventUnlock,
  foundStaleCurrentEvent,
  openEventDetail,
  openEventEditor,
  selectedEvent,
  updatedEventReceived,
  updatedOneEvent,
} from "./events";

import {
  closeGroupDashboard,
  joinedGroup,
  leftGroup,
  openGroupDashboard,
  selectedGroup,
  updatedOneGroup,
} from "./groups";

import {
  canceledInvitationReceived,
  createdInvitationReceived,
  receivedInvitations,
  rejectedGroupInvitation,
  sentInvitations,
} from "./invitations";

import {
  closeProjectDashboard,
  closeProjectForm,
  openProjectDashboard,
  openProjectForm,
  selectedProject,
  updatedOneProject,
} from "./projects";

import { receivedAllResources, receivedResource } from "./resources";

import {
  canceledReservation,
  closeReservationForm,
  closeReservationFormAdmin,
  openReservationForm,
  openReservationFormAdmin,
  receivedReservationCancelation,
  receivedReservationUpdate,
  updatedOneReservation,
} from "./reservations";

const closeEquipmentForm: StateHandler = (state) => ({
  ...state,
  equipmentFormIsOpen: false,
});

const closeSnackbar: StateHandler = (state) => {
  const [snackbarQueue] = dequeue(state.snackbarQueue);
  return { ...state, snackbarQueue };
};

const navigateBefore: StateHandler = (state, action) => {
  if (!state.ref?.current) {
    return impossibleState(state, action, "no calendar reference");
  }
  state.ref.current.getApi().prev();
  const currentStart = state.ref.current.getApi().getDate();
  return { ...state, currentStart };
};

const navigateNext: StateHandler = (state, action) => {
  if (!state.ref?.current) {
    return impossibleState(state, action, "no calendar reference");
  }
  state.ref.current.getApi().next();
  const currentStart = state.ref.current.getApi().getDate();
  return { ...state, currentStart };
};

const pickedDate: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentStart) {
    return missingResource(state, action, "no date returned from picker");
  }
  const currentStart = payload.currentStart;
  if (state.ref?.current) {
    state.ref.current.getApi().gotoDate(currentStart);
  }
  return { ...state, currentStart, pickerShowing: !state.pickerShowing };
};

const selectedLocation: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.resources || !payload.resources[ResourceKey.Locations]) {
    return missingResource(state, action, "no locations in selected location");
  }
  return {
    ...state,
    resources: {
      ...state.resources,
      [ResourceKey.Locations]: payload.resources[ResourceKey.Locations],
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

const viewToday: StateHandler = (state, action) => {
  if (!state.ref?.current) {
    return impossibleState(state, action, "no calendar reference");
  }
  state.ref.current.getApi().today();
  return { ...state, currentStart: new Date() };
};

const calendarReducer: StateHandler = (state, action) =>
  ({
    [CalendarAction.CanceledInvitationReceived]: canceledInvitationReceived,
    [CalendarAction.CanceledReservation]: canceledReservation,
    [CalendarAction.CloseEquipmentForm]: closeEquipmentForm,
    [CalendarAction.CloseEventDetail]: closeEventDetail,
    [CalendarAction.CloseEventEditor]: closeEventEditor,
    [CalendarAction.CloseGroupDashboard]: closeGroupDashboard,
    [CalendarAction.CloseProjectDashboard]: closeProjectDashboard,
    [CalendarAction.CloseProjectForm]: closeProjectForm,
    [CalendarAction.CloseReservationForm]: closeReservationForm,
    [CalendarAction.CloseReservationFormAdmin]: closeReservationFormAdmin,
    [CalendarAction.CloseSnackbar]: closeSnackbar,
    [CalendarAction.CreatedEventsReceived]: createdEventsReceived,
    [CalendarAction.CreatedInvitationReceived]: createdInvitationReceived,
    [CalendarAction.DeletedOneEvent]: deletedOneEvent,
    [CalendarAction.DisplayMessage]: displayMessage,
    [CalendarAction.Error]: errorHandler,
    [CalendarAction.EventLock]: eventLock,
    [CalendarAction.EventUnlock]: eventUnlock,
    [CalendarAction.FoundStaleCurrentEvent]: foundStaleCurrentEvent,
    [CalendarAction.JoinedGroup]: joinedGroup,
    [CalendarAction.LeftGroup]: leftGroup,
    [CalendarAction.NavigateBefore]: navigateBefore,
    [CalendarAction.NavigateNext]: navigateNext,
    [CalendarAction.OpenEventDetail]: openEventDetail,
    [CalendarAction.OpenEventEditor]: openEventEditor,
    [CalendarAction.OpenGroupDashboard]: openGroupDashboard,
    [CalendarAction.OpenProjectDashboard]: openProjectDashboard,
    [CalendarAction.OpenProjectForm]: openProjectForm,
    [CalendarAction.OpenReservationForm]: openReservationForm,
    [CalendarAction.OpenReservationFormAdmin]: openReservationFormAdmin,
    [CalendarAction.PickedDate]: pickedDate,
    [CalendarAction.ReceivedAllResources]: receivedAllResources,
    [CalendarAction.ReceivedInvitations]: receivedInvitations,
    [CalendarAction.ReceivedReservationCancelation]:
      receivedReservationCancelation,
    [CalendarAction.ReceivedReservationUpdate]: receivedReservationUpdate,
    [CalendarAction.ReceivedResource]: receivedResource,
    [CalendarAction.RejectedGroupInvitation]: rejectedGroupInvitation,
    [CalendarAction.SelectedEvent]: selectedEvent,
    [CalendarAction.SelectedGroup]: selectedGroup,
    [CalendarAction.SelectedLocation]: selectedLocation,
    [CalendarAction.SelectedProject]: selectedProject,
    [CalendarAction.SentInvitations]: sentInvitations,
    [CalendarAction.ToggleDrawer]: toggleDrawer,
    [CalendarAction.TogglePicker]: togglePicker,
    [CalendarAction.UpdatedOneEvent]: updatedOneEvent,
    [CalendarAction.UpdatedOneGroup]: updatedOneGroup,
    [CalendarAction.UpdatedOneProject]: updatedOneProject,
    [CalendarAction.UpdatedOneReservation]: updatedOneReservation,
    [CalendarAction.UpdatedEditedEventReceived]: updatedEventReceived,
    [CalendarAction.ViewToday]: viewToday,
  }[action.type](state, action));

export default logger(calendarReducer);
