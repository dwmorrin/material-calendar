import VirtualWeek from "../../resources/VirtualWeek";
import { getFormattedDate } from "../../utils/date";

const template = (virtualWeek: unknown): string[][] =>
  virtualWeek instanceof VirtualWeek
    ? [
        ["ID", virtualWeek.id.toString()],
        ["Start", getFormattedDate(virtualWeek.start)],
        ["End", getFormattedDate(virtualWeek.end)],
        ["Location ID", virtualWeek.locationId.toString()],
        ["Location hours", virtualWeek.locationHours.toString()],
        ["Project hours", virtualWeek.projectHours.toString()],
      ]
    : [["", JSON.stringify(virtualWeek)]];

export default template;
