import { Action, AdminAction, AdminState, ApiResponse } from "../types";
import { ResourceKey } from "../../../resources/types";
import VirtualWeek from "../../../resources/VirtualWeek";
import Semester from "../../../resources/Semester";
import Project from "../../../resources/Project";

interface CreateVirtualWeekProps {
  dispatch: (action: Action) => void;
  state: AdminState;
  locationId: number;
  start: string;
  end: string;
  semester: Semester;
}

// immediate submit from selection
export const createVirtualWeek = ({
  dispatch,
  state,
  locationId,
  semester,
  start,
  end,
}: CreateVirtualWeekProps): void => {
  const dispatchError = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });

  const handleData = ({ error, data }: ApiResponse): void => {
    if (error) return dispatchError(error);
    if (!data)
      return dispatchError(new Error("No data from create virtual week."));
    const { weeks, projects } = data as {
      weeks: VirtualWeek[];
      projects: Project[];
    };
    dispatch({
      type: AdminAction.ReceivedResourcesAfterVirtualWeekUpdate,
      payload: {
        resources: {
          ...state.resources,
          [ResourceKey.VirtualWeeks]: weeks.map((vw) => new VirtualWeek(vw)),
          [ResourceKey.Projects]: projects.map((p) => new Project(p)),
        },
      },
    });
  };

  fetch(`${VirtualWeek.url}/`, {
    method: "POST",
    body: JSON.stringify({
      start,
      end,
      locationId,
      semesterId: semester.id,
    }),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then(handleData)
    .catch(dispatchError);
};
