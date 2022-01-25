import { StateHandler } from "./types";
import UserGroup from "../../resources/UserGroup";
import { ResourceKey } from "../../resources/types";

import { impossibleState, missingResource } from "./errorRedirect";
import { openGroupDashboard } from "./groups";
import Project from "../../resources/Project";

import arrayUpdateAt from "./arrayUpdateAt";

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

export const updatedOneProject: StateHandler = (state, action) => {
  if (!action.payload?.resources)
    return missingResource(state, action, "no resources in update project");
  const project = action.payload.resources[ResourceKey.Projects][0] as Project;
  const projects = state.resources[ResourceKey.Projects] as Project[];
  const index = projects.findIndex((p) => p.id === project.id);
  return {
    ...state,
    currentProject:
      state.currentProject?.id === project.id ? project : state.currentProject,
    resources: {
      ...state.resources,
      [ResourceKey.Projects]: arrayUpdateAt(projects, index, project),
    },
  };
};
