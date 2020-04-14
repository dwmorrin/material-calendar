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
  [extendedProp: string]: unknown;
  allDay?: boolean | undefined;
  allow?: import("./Core").AllowFunc | undefined;
  backgroundColor?: string | undefined;
  borderColor?: string | undefined;
  className?: string | string[] | undefined;
  classNames?: string | string[] | undefined;
  color?: string | undefined;
  constraint?: string | EventInput | EventInput[] | undefined;
  date?: string | number | Date | number[] | undefined;
  durationEditable?: boolean | undefined;
  editable?: boolean | undefined;
  extendedProps?: object | undefined;
  groupId?: string | number | undefined;
  overlap?: boolean | undefined;
  rendering?: "" | "background" | "none" | "inverse-background" | undefined;
  startEditable?: boolean | undefined;
  textColor?: string | undefined;
  url?: string | undefined;
}

export default Event;
