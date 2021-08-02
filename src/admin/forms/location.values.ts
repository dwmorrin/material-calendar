import Location from "../../resources/Location";
import { AdminState } from "../types";

interface LocationValues extends Record<string, unknown> {
  id: number;
  title: string;
  groupId: string;
  restriction: string;
  allowsWalkIns: boolean;
}

export const values = (state: AdminState): Record<string, unknown> => {
  const location = state.resourceInstance as Location;
  return {
    id: location.id,
    title: location.title,
    groupId: location.groupId,
    restriction: String(location.restriction),
    allowsWalkIns: location.allowsWalkIns,
  } as LocationValues;
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Location => {
  const { title, groupId, restriction, allowsWalkIns } =
    values as LocationValues;
  const location = new Location(state.resourceInstance as Location);
  return {
    ...location,
    title,
    groupId,
    restriction: Number(restriction),
    allowsWalkIns,
  };
};
