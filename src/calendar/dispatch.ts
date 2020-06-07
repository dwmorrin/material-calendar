/**
 * these are "dispatch helpers"
 * the only allowed side effect is to call a supplied "dispatch" function
 * otherwise only use pure functions
 *
 * the goal is to remove the pure functions (often contain messy looking
 * maps & reducers with ternarys & spread operators) from the component files.
 */
import { Action, CalendarAction, CalendarState } from "./types";
import { ResourceKey } from "../resources/types";
import Location from "../resources/Location";
import Project from "../resources/Project";
import { setPropIf } from "../utils/setPropIf";

const setSelectedByCourseTitle = (
  courseTitle: string,
  selected: boolean
): ((p: Project) => Project) =>
  setPropIf<Project>(
    (p) => p.course.title === courseTitle,
    "selected",
    selected
  );

const toggleProjectSelectedByCourse = (
  projects: Project[],
  courseTitle: string,
  selected: boolean
): Project[] =>
  projects.reduce(
    (marked, project) => [
      ...marked,
      setSelectedByCourseTitle(courseTitle, selected)(project),
    ],
    [] as Project[]
  );

export const dispatchSelectedProjectsByCourse = (
  state: CalendarState,
  dispatch: (action: Action) => void,
  id: string,
  selected: boolean
): void =>
  dispatch({
    type: CalendarAction.SelectedProject,
    payload: {
      resources: {
        [ResourceKey.Projects]: toggleProjectSelectedByCourse(
          state.resources[ResourceKey.Projects] as Project[],
          id,
          selected
        ),
      },
    },
  });

export const dispatchSelectedProject = (
  state: CalendarState,
  dispatch: (action: Action) => void,
  id: number,
  selected?: boolean
): void =>
  dispatch({
    type: CalendarAction.SelectedProject,
    payload: {
      resources: {
        [ResourceKey.Projects]: (state.resources[
          ResourceKey.Projects
        ] as Project[]).map(
          setPropIf<Project>(
            (project) => project.id === id,
            "selected",
            selected
          )
        ),
      },
    },
  });

export const dispatchSelectedLocation = (
  state: CalendarState,
  dispatch: (action: Action) => void,
  id: string,
  selected: boolean
): void =>
  dispatch({
    type: CalendarAction.SelectedLocation,
    payload: {
      resources: {
        [ResourceKey.Locations]: (state.resources[
          ResourceKey.Locations
        ] as Location[]).map(
          setPropIf<Location>(
            (location) => location.groupId === id,
            "selected",
            selected
          )
        ),
      },
    },
  });

export const dispatchSelectedLocationGroup = (
  state: CalendarState,
  dispatch: (action: Action) => void,
  id: number,
  selected: boolean
): void =>
  dispatch({
    type: CalendarAction.SelectedLocation,
    payload: {
      resources: {
        [ResourceKey.Locations]: (state.resources[
          ResourceKey.Locations
        ] as Location[]).map(
          setPropIf<Location>(
            (location) => location.id === id,
            "selected",
            selected
          )
        ),
      },
    },
  });
