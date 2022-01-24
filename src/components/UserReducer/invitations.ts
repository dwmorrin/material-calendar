import { StateHandler } from "./types";
import { CalendarAction } from "../types";
import displayMessage from "./displayMessage";
import { missingResource } from "./errorRedirect";

export const canceledInvitationReceived: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload) return missingResource(state, action, "no updated groups");
  return displayMessage(
    {
      ...state,
      resources: {
        ...state.resources,
        ...payload?.resources,
      },
    },
    {
      type: CalendarAction.DisplayMessage,
      payload: {
        message: "Your invitation has been canceled",
      },
    }
  );
};

export const createdInvitationReceived: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload) return missingResource(state, action, "no group in payload");
  return displayMessage(
    {
      ...state,
      currentGroup: payload.currentGroup,
      resources: {
        ...state.resources,
        ...action.payload?.resources,
      },
    },
    {
      type: CalendarAction.DisplayMessage,
      payload: {
        message: "Invitations sent",
      },
    }
  );
};

export const receivedInvitations: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload) {
    return missingResource(state, action, "no invitations in received");
  }
  return { ...state, resources: { ...state.resources, ...payload.resources } };
};

export const rejectedGroupInvitation: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload) {
    return missingResource(
      state,
      action,
      "no data after rejecting group invitation"
    );
  }
  return displayMessage(
    {
      ...state,
      currentGroup: payload.currentGroup,
      resources: { ...state.resources, ...payload.resources },
    },
    {
      type: CalendarAction.DisplayMessage,
      payload: {
        message: "You have declined the invitation",
      },
    }
  );
};

export const sentInvitations: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload)
    return missingResource(
      state,
      action,
      "no invitations received from server"
    );
  return displayMessage(
    { ...state },
    {
      type: CalendarAction.DisplayMessage,
      payload: {
        message: "Invitations sent",
      },
    }
  );
};
