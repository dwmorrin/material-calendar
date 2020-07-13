import Project from "../../resources/Project";
import { getFormattedDate, getFormattedEventInterval } from "../../utils/date";

const template = (project: unknown): string[][] =>
  project instanceof Project
    ? [
        ["ID", project.id.toString()],
        ["Title", project.title],
        ["Course", project.course.title || "none"],
        ["Duration", getFormattedEventInterval(project.start, project.end)],
        ["Reservations start", getFormattedDate(project.reservationStart)],
        [
          "Managers",
          project.managers
            .map((manager) => manager.name?.first + " " + manager.name?.last)
            .join(", "),
        ],
        ["Group size", project.groupSize.toString()],
        ["Allotments", project.allotments.length.toString()],
      ]
    : [["", JSON.stringify(project)]];

export default template;
