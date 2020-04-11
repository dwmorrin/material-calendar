import { EventInput } from "./Core";

class Event implements EventInput {
  public resourceId: string;
  constructor(
    readonly id: number,
    public start: string,
    public end: string,
    public location: string,
    public title: string
  ) {
    this.resourceId = location;
  }
}

export default Event;
