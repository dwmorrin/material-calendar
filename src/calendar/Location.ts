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

class Location implements Resource {
  public eventColor?: string;
  public selected = false;
  constructor(readonly id: string, public name: string) {}
}

export default Location;
