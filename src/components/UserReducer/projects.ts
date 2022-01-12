import { StateHandler } from "./types";
import UserGroup from "../../resources/UserGroup";
import { ResourceKey } from "../../resources/types";

import { missingResource } from "./errorRedirect";
import { openGroupDashboard } from "./groups";

export const closeProjectDashboard: StateHandler = (state) => ({
  ...state,
  projectDashboardIsOpen: false,
  currentProject: undefined,
  currentGroup: undefined,
});

export const closeProjectForm: StateHandler = (state) => ({
  ...state,
  projectFormIsOpen: false,
});

export const openProjectDashboard: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload || !payload.currentProject) {
    return missingResource(
      state,
      action,
      "no current project found; cannot open project"
    );
  }
  const { currentGroup, resources } = state;
  const { currentProject } = payload;
  const groups = resources[ResourceKey.Groups] as UserGroup[];
  const group =
    currentGroup ||
    groups
      .filter(({ pending }) => !pending)
      .find((group) => group.projectId === currentProject.id);
  if (!group) {
    return openGroupDashboard(
      {
        ...state,
        currentGroup: group,
        currentProject: currentProject,
        projectDashboardIsOpen: true,
        groupDashboardIsOpen: true,
      },
      action
    );
  }
  return {
    ...state,
    currentGroup: group,
    currentProject: currentProject,
    projectDashboardIsOpen: true,
  };
};

export const openProjectForm: StateHandler = (state, { payload }) => {
  return {
    ...state,
    currentCourse: payload?.currentCourse,
    projectFormIsOpen: true,
  };
};

export const selectedProject: StateHandler = (state, action) => {
  const { payload } = action;
  if (!payload?.resources || !payload.resources[ResourceKey.Projects]) {
    return missingResource(
      state,
      action,
      "no user projects in selected projects"
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
