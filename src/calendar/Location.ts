import Resource from "./Resource";

class Location implements Resource {
  public eventColor?: string;
  public selected = false;
  constructor(readonly id: string, public name: string) {}
}

export default Location;
