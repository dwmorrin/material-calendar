import { EventInput } from "./Core";

export interface EventData {
  end: string;
  id: string;
  location: string;
  start: string;
  title: string;
}

class Event implements EventInput {
  public allDay?: boolean | undefined;
  public allow?: import("./Core").AllowFunc | undefined;
  public backgroundColor?: string | undefined;
  public borderColor?: string | undefined;
  public className?: string | string[] | undefined;
  public classNames?: string | string[] | undefined;
  public color?: string | undefined;
  public constraint?: string | EventInput | EventInput[] | undefined;
  public date?: string | number | Date | number[] | undefined;
  public durationEditable?: boolean | undefined;
  public editable?: boolean | undefined;
  public end: string;
  public extendedProps?: object | undefined;
  public groupId?: string | number | undefined;
  public id: string;
  public location: string;
  public overlap?: boolean | undefined;
  public rendering?:
    | ""
    | "background"
    | "none"
    | "inverse-background"
    | undefined;
  public resourceId: string;
  public start: string;
  public startEditable?: boolean | undefined;
  public textColor?: string | undefined;
  public title: string;
  public url?: string | undefined;
  [extendedProp: string]: unknown;
  constructor(data: EventData) {
    this.id = "" + data.id;
    this.start = data.start;
    this.end = data.end;
    this.title = data.title;
    this.location = data.location;
    this.resourceId = data.location;
  }
}

export default Event;
