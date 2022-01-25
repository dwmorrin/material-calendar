import { CalendarAction } from "../types";
import { StateHandler } from "./types";
import { ResourceKey } from "../../resources/types";
import UserGroup from "../../resources/UserGroup";

import { missingResource } from "./errorRedirect";
import displayMessage from "./displayMessage";

import { closeProjectDashboard } from "./projects";

import arrayUpdateAt from "./arrayUpdateAt";

export const closeGroupDashboard: StateHandler = (state, action) => {
  if (state.currentGroup == undefined) {
    return closeProjectDashboard(
      {
        ...state,
        groupDashboardIsOpen: false,
        projectDashboardIsOpen: false,
        currentProject: undefined,
        currentGroup: undefined,
      },
      action
    );
  } else {
    return {
      ...state,
      groupDashboardIsOpen: false,
    };
  }
};

export const joinedGroup: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentGroup) {
    return missingResource(state, action, "no group joined");
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
        message: "You have joined the group",
      },
    }
  );
};

export const leftGroup: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload) {
    return missingResource(
      state,
      action,
      "missing new invitations after leaving group"
    );
  }
  return displayMessage(
    {
      ...state,
      currentGroup: undefined,
      resources: { ...state.resources, ...payload?.resources },
    },
    {
      type: CalendarAction.DisplayMessage,
      payload: {
        message: "You have left the group",
      },
    }
  );
};

export const openGroupDashboard: StateHandler = (state) => ({
  ...state,
  // currentProject: payload?.currentProject,
  groupDashboardIsOpen: true,
});

export const selectedGroup: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.currentGroup) {
    return missingResource(state, action, "no group in selected group");
  }
  return { ...state, currentGroup: payload.currentGroup };
};

export const updatedOneGroup: StateHandler = (state, action) => {
  if (!action.payload?.resources)
    return missingResource(state, action, "no resources in updated group");
  const group = action.payload.resources[ResourceKey.Groups][0] as UserGroup;
  const groups = state.resources[ResourceKey.Groups] as UserGroup[];
  const index = groups.findIndex((g) => g.id === group.id);
  return {
    ...state,
    currentGroup:
      state.currentGroup?.id === group.id ? group : state.currentGroup,
    resources: {
      ...state.resources,
      [ResourceKey.Groups]: arrayUpdateAt(groups, index, group),
    },
  };
};
