import { ResourceInput } from "@fullcalendar/resource-common/structs/resource";

export interface LocationDictionary {
  [k: string]: boolean;
}

export interface LocationGroups {
  [k: string]: Location[];
}

export const makeSelectedLocationDict = (
  locations: Location[]
): LocationDictionary => {
  const dict: LocationDictionary = {};
  locations.forEach((location) => {
    dict[location.id] = location.selected;
  });
  return dict;
};

export const locationGroupReducer = (
  groups: LocationGroups | undefined,
  location: Location
): LocationGroups | undefined => {
  if (!location.groupId) {
    return groups;
  }
  if (groups) {
    if (!groups[location.groupId]) {
      groups[location.groupId] = [location];
      return groups;
    }
    groups[location.groupId].push(location);
    return groups;
  }
};

interface Location extends ResourceInput {
  id: string;
  selected: boolean;
  groupId: string;
}

class Location implements Location {
  public selected = false;
  constructor(location: Location) {
    Object.assign(this, location);
  }
}

export default Location;
