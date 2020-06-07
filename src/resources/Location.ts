// TODO there are placeholders here for incorporating FullCalender business hours
// TODO these should be implemented or removed
export enum Days {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

/**
 * daysOfWeek contains each day marked true/false, for checkboxes
 * Sunday=0
 */
export interface FormBusinessHours {
  daysOfWeek: { [k: string]: boolean };
  startTime: string; // format "00:00"
  endTime: string; // format "00:00"
}

/**
 * Sunday=0
 */
export interface BusinessHours {
  daysOfWeek: Days[];
  startTime: string;
  endTime: string;
}

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
    dict[location.title] = location.selected || false;
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

interface Location {
  [k: string]: unknown;
  id: number;
  title: string;
  groupId: string; // for UI, to group by categories
  selected?: boolean;
}

class Location implements Location {
  static url = "/api/locations";
  constructor(
    location = {
      id: 0,
      title: "",
      groupId: "",
    }
  ) {
    Object.assign(this, location);
  }
}

export default Location;
