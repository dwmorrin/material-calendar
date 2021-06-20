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

export interface LocationHours {
  id: number;
  hours: number;
  date: string;
  start?: string; // MySQL TIME format "00:00:00", e.g. 08:00:00 for 8 AM
  end?: string; // MySQL TIME format "00:00:00", e.g. 25:00:00 for 1 AM next day
  semesterId?: number; // legacy data
  locationId?: number; // legacy data
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
  hours: LocationHours[];
  restriction: number;
}

class Location implements Location {
  static url = "/api/locations";
  static locationHoursId = "002-LocationHours"; // magic number to set scheduler order
  constructor(
    location = {
      id: 0,
      title: "",
      groupId: "",
      hours: [] as LocationHours[],
      restriction: 0,
    }
  ) {
    Object.assign(this, {
      ...location,
      hours: location.hours.map(Location.locationHoursAdapter),
    });
  }

  /**
   * legacy database only stores an integer amount of hours, but does not record
   * how that number is derived, i.e. the start and end times.
   * This applies a default start/end to legacy data.
   */
  static locationHoursAdapter(locationHours: LocationHours): LocationHours {
    if (locationHours.start && locationHours.end) return locationHours;
    const defaultStartHour = 9;
    const makeDefaultTimeString = (hour = defaultStartHour): string =>
      hour.toString().padStart(2, "0") + ":00:00";
    return {
      ...locationHours,
      start: makeDefaultTimeString(),
      end: makeDefaultTimeString(defaultStartHour + locationHours.hours),
    };
  }
}

export default Location;
