import Location from "../../../resources/Location";
import { AdminState } from "../../../admin/types";

interface LocationValues extends Record<string, unknown> {
  id: number;
  title: string;
  groupId: string;
  restriction: string;
  allowsWalkIns: boolean;
  defaultHours: {
    [key: string]: string;
  };
}

export const values = (state: AdminState): Record<string, unknown> => {
  const location = state.resourceInstance as Location;
  return {
    id: location.id,
    title: location.title,
    groupId: location.groupId,
    restriction: String(location.restriction),
    allowsWalkIns: location.allowsWalkIns,
    defaultHours: Object.entries(location.defaultHours).reduce(
      (res, [day, hours]) => ({ ...res, [day]: String(hours) }),
      {}
    ),
  } as LocationValues;
};

export const update = (
  state: AdminState,
  values: Record<string, unknown>
): Location => {
  const { title, groupId, restriction, allowsWalkIns, defaultHours } =
    values as LocationValues;
  const location = new Location(state.resourceInstance as Location);
  return {
    ...location,
    title,
    groupId,
    restriction: Number(restriction),
    allowsWalkIns,
    defaultHours: Object.entries(defaultHours).reduce(
      (res, [day, hours]) => ({ ...res, [day]: Number(hours) }),
      {} as {
        monday: number;
        tuesday: number;
        wednesday: number;
        thursday: number;
        friday: number;
        saturday: number;
        sunday: number;
      }
    ),
  };
};
