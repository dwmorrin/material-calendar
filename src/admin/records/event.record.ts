import Event from "../../resources/Event";
import { parseAndFormatSQLDatetimeInterval } from "../../utils/date";

const template = (event: unknown): string[][] =>
  event instanceof Event
    ? [
        ["Duration", parseAndFormatSQLDatetimeInterval(event)],
        ["Location", event.location.title],
        ["Title", event.title],
        ["Reservable", event.reservable ? "Yes" : "No"],
      ]
    : [["", JSON.stringify(event)]];

export default template;
