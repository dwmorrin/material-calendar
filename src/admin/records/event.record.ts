import Event from "../../resources/Event";
import { getFormattedEventInterval } from "../../utils/date";

const template = (event: unknown): string[][] =>
  event instanceof Event
    ? [
        ["Duration", getFormattedEventInterval(event.start, event.end)],
        ["Location", event.location.title],
        ["Title", event.title],
        ["Reservable", event.reservable ? "Yes" : "No"],
      ]
    : [["", JSON.stringify(event)]];

export default template;
