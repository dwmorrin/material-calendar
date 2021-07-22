import { Action, AdminAction, AdminState, ApiResponse } from "./types";
import { ResourceKey } from "../resources/types";
import VirtualWeek from "../resources/VirtualWeek";
import Semester from "../resources/Semester";

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

  const handleData = ({ error }: ApiResponse): void => {
    if (error) return dispatchError(error);
    fetch(`${VirtualWeek.url}`)
      .then((response) => response.json())
      .then(({ error, data }) =>
        dispatch(
          error || !data
            ? { type: AdminAction.Error, payload: { error } }
            : {
                type: AdminAction.ReceivedResource,
                meta: ResourceKey.VirtualWeeks,
                payload: {
                  resources: {
                    ...state.resources,
                    [ResourceKey.VirtualWeeks]: (data as VirtualWeek[]).map(
                      (vw) => new VirtualWeek(vw)
                    ),
                  },
                },
              }
        )
      )
      .catch(dispatchError);
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
