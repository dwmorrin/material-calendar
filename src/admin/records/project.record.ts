import Project from "../../resources/Project";
import {
  parseSQLDate,
  formatSlashed,
  parseAndFormatSQLDateInterval,
} from "../../utils/date";

const template = (project: unknown): string[][] =>
  project instanceof Project
    ? [
        ["ID", project.id.toString()],
        ["Title", project.title],
        ["Course", project.course.title || "none"],
        ["Duration", parseAndFormatSQLDateInterval(project)],
        [
          "Reservations start",
          formatSlashed(parseSQLDate(project.reservationStart)),
        ],
        ["Group size", project.groupSize.toString()],
        ["Allotments", project.allotments.length.toString()],
      ]
    : [["", JSON.stringify(project)]];

export default template;
