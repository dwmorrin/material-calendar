import Resource from "./Resource";

class Location implements Resource {
  public eventColor?: string;
  constructor(readonly id: string, public name: string) {}
}

export default Location;
