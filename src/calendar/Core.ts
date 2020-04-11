/**
 * Extracted from the FullCalendar library as a hack way of accessing the types.
 * for the purpose of extending them.
 */
export interface DateSpanApi {
  start: Date;
  end: Date;
  startStr: string;
  endStr: string;
  allDay: boolean;
}
export type ConstraintInput =
  | "businessHours"
  | string
  | EventInput
  | EventInput[];
export type AllowFunc = (span: DateSpanApi, movingEvent: {} | null) => boolean;
export type EventRenderingChoice =
  | ""
  | "background"
  | "inverse-background"
  | "none";
export interface UnscopedEventUiInput {
  editable?: boolean;
  startEditable?: boolean;
  durationEditable?: boolean;
  constraint?: ConstraintInput;
  overlap?: boolean;
  allow?: AllowFunc;
  className?: string[] | string;
  classNames?: string[] | string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  color?: string;
}
export type DateInput = Date | string | number | number[];
export interface EventNonDateInput extends UnscopedEventUiInput {
  id?: string | number;
  groupId?: string | number;
  title?: string;
  url?: string;
  rendering?: EventRenderingChoice;
  extendedProps?: object;
  [extendedProp: string]: any;
}
export interface EventDateInput {
  start?: DateInput;
  end?: DateInput;
  date?: DateInput;
  allDay?: boolean;
}
export type EventInput = EventNonDateInput & EventDateInput;
