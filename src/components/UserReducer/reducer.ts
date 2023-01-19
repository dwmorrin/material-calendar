import { CalendarAction } from "../types";
import { ResourceKey } from "../../resources/types";
import { dequeue } from "../../utils/queue";
import { StateHandler } from "./types";

import displayMessage from "./displayMessage";
import errorHandler from "./errorHandler";
import { missingResource } from "./errorRedirect";
import logger from "./logger";
import { addDays, parseSQLDate } from "../../utils/date";

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
  updatedReservationEvents,
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
  canceledReservationAdmin,
  closeReservationForm,
  closeReservationFormAdmin,
  openReservationForm,
  openReservationFormAdmin,
  receivedAdminReservationUpdate,
  receivedReservationCancelation,
  receivedReservationUpdate,
} from "./reservations";

const closeEquipmentForm: StateHandler = (state) => ({
  ...state,
  equipmentFormIsOpen: false,
});

const closeHelpDialog: StateHandler = (state) => ({
  ...state,
  helpDialogIsOpen: false,
});

const closeSnackbar: StateHandler = (state) => {
  const [snackbarQueue] = dequeue(state.snackbarQueue);
  return { ...state, snackbarQueue };
};

const closeStaffReservationForm: StateHandler = (state) => {
  return { ...state, staffReservationFormIsOpen: false };
};

const openHelpDialog: StateHandler = (state) => ({
  ...state,
  helpDialogIsOpen: true,
});

const openStaffReservationForm: StateHandler = (state) => ({
  ...state,
  staffReservationFormIsOpen: true,
});

const navigate: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentStart) {
    return missingResource(state, action, "no date returned from navigation");
  }
  return { ...state, currentStart: payload.currentStart };
};

const pickedDate: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentStart) {
    return missingResource(state, action, "no date returned from picker");
  }
  const currentStart = payload.currentStart;
  return { ...state, currentStart, pickerShowing: false };
};

const receivedCurrentSemester: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentSemester) {
    return missingResource(state, action, "current semester not found");
  }
  const currentSemester = payload.currentSemester;
  return {
    ...state,
    currentSemester,
    eventRange: {
      start: parseSQLDate(currentSemester.start),
      end: addDays(parseSQLDate(currentSemester.end), 1),
    },
  };
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

const calendarReducer: StateHandler = (state, action) =>
  ({
    [CalendarAction.CanceledInvitationReceived]: canceledInvitationReceived,
    [CalendarAction.CanceledReservationAdmin]: canceledReservationAdmin,
    [CalendarAction.CloseEquipmentForm]: closeEquipmentForm,
    [CalendarAction.CloseEventDetail]: closeEventDetail,
    [CalendarAction.CloseEventEditor]: closeEventEditor,
    [CalendarAction.CloseGroupDashboard]: closeGroupDashboard,
    [CalendarAction.CloseHelpDialog]: closeHelpDialog,
    [CalendarAction.CloseProjectDashboard]: closeProjectDashboard,
    [CalendarAction.CloseProjectForm]: closeProjectForm,
    [CalendarAction.CloseReservationForm]: closeReservationForm,
    [CalendarAction.CloseReservationFormAdmin]: closeReservationFormAdmin,
    [CalendarAction.CloseSnackbar]: closeSnackbar,
    [CalendarAction.CloseStaffReservationForm]: closeStaffReservationForm,
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
    [CalendarAction.NavigateBefore]: navigate,
    [CalendarAction.NavigateNext]: navigate,
    [CalendarAction.OpenEventDetail]: openEventDetail,
    [CalendarAction.OpenEventEditor]: openEventEditor,
    [CalendarAction.OpenGroupDashboard]: openGroupDashboard,
    [CalendarAction.OpenHelpDialog]: openHelpDialog,
    [CalendarAction.OpenProjectDashboard]: openProjectDashboard,
    [CalendarAction.OpenProjectForm]: openProjectForm,
    [CalendarAction.OpenReservationForm]: openReservationForm,
    [CalendarAction.OpenReservationFormAdmin]: openReservationFormAdmin,
    [CalendarAction.OpenStaffReservationForm]: openStaffReservationForm,
    [CalendarAction.PickedDate]: pickedDate,
    [CalendarAction.ReceivedAdminReservationUpdate]:
      receivedAdminReservationUpdate,
    [CalendarAction.ReceivedAllResources]: receivedAllResources,
    [CalendarAction.ReceivedCurrentSemester]: receivedCurrentSemester,
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
    [CalendarAction.UpdatedEditedEventReceived]: updatedEventReceived,
    [CalendarAction.UpdatedOneGroup]: updatedOneGroup,
    [CalendarAction.UpdatedOneProject]: updatedOneProject,
    [CalendarAction.UpdatedReservationEvents]: updatedReservationEvents,
    [CalendarAction.ViewToday]: navigate,
  }[action.type](state, action));

export default logger(calendarReducer);
