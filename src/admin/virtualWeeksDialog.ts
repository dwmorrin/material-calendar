import { Action, AdminAction, AdminState, ApiResponse } from "./types";
import { ResourceKey } from "../resources/types";
import VirtualWeek from "../resources/VirtualWeek";

interface CreateVirtualWeekProps {
  dispatch: (action: Action) => void;
  state: AdminState;
  start: string;
  end: string;
}

// immediate submit from selection
export const createVirtualWeek = ({
  dispatch,
  state,
  start,
  end,
}: CreateVirtualWeekProps): void => {
  const dispatchError = (error: Error): void =>
    dispatch({ type: AdminAction.Error, payload: { error } });

  const { selectedSemester: semester, schedulerLocationId: locationId } = state;
  if (!semester) return dispatchError(new Error("no semester selected"));

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
