export interface LocationHours {
  id: number;
  hours: number;
  date: string;
}

interface Location {
  [k: string]: unknown;
  id: number;
  title: string;
  groupId: string; // for UI, to group by categories
  selected?: boolean;
  hours: LocationHours[];
  restriction: number;
  allowsWalkIns: boolean;
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
      allowsWalkIns: false,
    }
  ) {
    Object.assign(this, location);
  }
}

export default Location;
