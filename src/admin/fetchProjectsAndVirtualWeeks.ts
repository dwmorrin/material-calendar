import { ResourceKey } from "../resources/types";
import Project from "../resources/Project";
import VirtualWeek from "../resources/VirtualWeek";
import { Action, AdminAction, AdminState } from "./types";

export default function fetchProjectsAndVirtualWeeks({
  dispatch,
  state,
  type,
}: {
  dispatch: (action: Action) => void;
  state: AdminState;
  type: AdminAction;
}): void {
  const dispatchError = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });
  Promise.all([
    fetch(`${Project.url}?context=${ResourceKey.Projects}`),
    fetch(`${VirtualWeek.url}?context=${ResourceKey.VirtualWeeks}`),
  ])
    .then((responses) =>
      Promise.all(responses.map((response) => response.json()))
        .then((dataArray) => {
          if (dataArray.some(({ error }) => !!error))
            // returning the first error only; better if we could return all
            return dispatchError(dataArray.find(({ error }) => !!error).error);
          const projects = dataArray.find(
            ({ context }) => Number(context) === ResourceKey.Projects
          );
          if (!projects || !Array.isArray(projects.data))
            return dispatchError(
              new Error("no projects returned in allotment update")
            );
          const virtualWeeks = dataArray.find(
            ({ context }) => Number(context) === ResourceKey.VirtualWeeks
          );
          if (!virtualWeeks || !Array.isArray(virtualWeeks.data))
            return dispatchError(
              new Error("no virtual weeks returned in allotment update")
            );
          dispatch({
            type,
            payload: {
              resources: {
                ...state.resources,
                [ResourceKey.Projects]: projects.data.map(
                  (p: Project) => new Project(p)
                ),
                [ResourceKey.VirtualWeeks]: virtualWeeks.data.map(
                  (v: VirtualWeek) => new VirtualWeek(v)
                ),
              },
            },
          });
        })
        .catch(dispatchError)
    )
    .catch(dispatchError);
}
