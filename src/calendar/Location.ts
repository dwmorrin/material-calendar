import Resource from "./Resource";

export interface LocationDictionary {
  [k: string]: boolean;
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

export interface LocationData {
  id: string;
  title: string;
  eventColor?: string;
  groupId?: string;
}

class Location implements Resource {
  public selected = false;
  public id: string;
  public title: string;
  public eventColor: string;
  public groupId: string;
  constructor(data: LocationData) {
    this.id = data.id;
    this.title = data.title;
    this.eventColor = data.eventColor || "";
    this.groupId = data.groupId || "";
  }
}

export default Location;
